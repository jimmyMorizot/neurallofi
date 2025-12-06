import type { MusicStyle, TextureType, GenerationStatus } from '@/types';
import { buildPrompt } from '@/types';
import { getTask, setTask, updateTask } from './taskCache';

// MusicGPT API Configuration - Real API endpoints
const MUSICGPT_API_URL = process.env.MUSICGPT_API_URL || 'https://api.musicgpt.com';
const MUSICGPT_API_KEY = process.env.MUSICGPT_API_KEY || '';

/**
 * Get the music style label for the API
 */
function getStyleLabel(style: MusicStyle): string {
  const labels: Record<MusicStyle, string> = {
    classic: 'Lo-fi Hip Hop',
    indian: 'Indian Lo-fi',
    african: 'Afrobeats Lo-fi',
    asian: 'Asian Lo-fi',
    latino: 'Bossa Nova Lo-fi',
  };
  return labels[style];
}

/**
 * Generate music using MusicGPT API
 * API Docs: https://docs.musicgpt.com/api-documentation/conversions/musicai
 */
export async function generateMusic(
  style: MusicStyle,
  textures: TextureType[],
  withVocals: boolean = false,
  customLyrics?: string
): Promise<{ taskId: string; eta: number }> {
  const prompt = buildPrompt(style, textures);

  // Generate a unique local task ID
  const taskId = generateTaskId();

  // Store initial task status (file-based for serverless persistence)
  await setTask(taskId, {
    status: 'pending',
    style,
    progress: 'Initializing generation...',
    createdAt: new Date().toISOString(),
  });

  // Check if we should use mock mode
  const apiKey = MUSICGPT_API_KEY?.trim() || '';
  const isValidApiKey = apiKey.length > 20 && !apiKey.includes('your_api_key');

  console.log('[MusicGPT] API Key status:', isValidApiKey ? 'Valid key detected' : 'No valid key - using MOCK mode');

  // If no valid API key, use mock mode
  if (!isValidApiKey) {
    console.log('[MusicGPT Mock] Starting generation with prompt:', prompt);

    // Simulate async generation
    simulateMockGeneration(taskId, style);

    return { taskId, eta: 15 }; // Mock ETA
  }

  try {
    // Real MusicGPT API call
    // Endpoint: POST /api/public/v1/MusicAI
    const response = await fetch(`${MUSICGPT_API_URL}/api/public/v1/MusicAI`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MUSICGPT_API_KEY, // No Bearer prefix per docs
      },
      body: JSON.stringify({
        prompt: prompt,
        music_style: getStyleLabel(style),
        make_instrumental: !withVocals, // true = instrumental only, false = with AI vocals
        vocal_only: false, // false = music + vocals, true = vocals only (a cappella)
        ...(withVocals && customLyrics ? { lyrics: customLyrics } : {}), // Custom or AI-generated lyrics
        // voice_id: '', // Default AI voice
        // webhook_url: '', // We poll instead
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MusicGPT API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('[MusicGPT] Generate response:', JSON.stringify(data, null, 2));

    // Response format: { success, message, task_id, conversion_id_1, conversion_id_2, eta }
    if (!data.success) {
      throw new Error(data.message || 'MusicGPT API returned unsuccessful response');
    }

    console.log('[MusicGPT] Generation started! Task ID:', data.task_id);
    console.log('[MusicGPT] Conversion IDs:', data.conversion_id_1, data.conversion_id_2);
    console.log('[MusicGPT] ETA:', data.eta, 'seconds');

    // Update task with MusicGPT IDs
    await updateTask(taskId, {
      status: 'processing',
      progress: 'Generation started...',
      musicGptTaskId: data.task_id,
      conversionId1: data.conversion_id_1,
      conversionId2: data.conversion_id_2,
    });

    // No background polling - checkStatus will check MusicGPT directly

    return {
      taskId,
      eta: data.eta || 120,
    };
  } catch (error) {
    await updateTask(taskId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Check the status of a generation task
 * Directly queries MusicGPT API if task is still processing
 */
export async function checkStatus(taskId: string): Promise<{
  status: GenerationStatus;
  progress?: string;
  files?: { url: string; version: number }[];
  error?: string;
}> {
  const task = await getTask(taskId);

  if (!task) {
    console.log('[MusicGPT] Task not found in cache:', taskId);
    return {
      status: 'failed',
      error: 'Task not found',
    };
  }

  // If task is already completed or failed, return cached status
  if (task.status === 'completed' || task.status === 'failed') {
    return {
      status: task.status,
      progress: task.progress,
      files: task.files,
      error: task.error,
    };
  }

  // If task is processing and we have conversion IDs, check MusicGPT directly
  if (task.conversionId1) {
    try {
      const result = await fetchConversionStatus(task.conversionId1);
      const conv = result?.conversion;

      if (!conv) {
        return {
          status: 'processing',
          progress: 'Checking generation status...',
        };
      }

      const apiStatus = conv.status?.toUpperCase();
      console.log('[MusicGPT] Direct status check:', apiStatus);

      // Check if completed
      if (apiStatus === 'COMPLETED' && conv.conversion_path_1 && conv.conversion_path_2) {
        console.log('[MusicGPT] Generation complete! Downloading files...');

        // Download and save files
        const savedFiles = await downloadAndSaveFiles(
          [
            { url: conv.conversion_path_1 },
            { url: conv.conversion_path_2 },
          ],
          taskId,
          task.style
        );

        // Update cache
        await updateTask(taskId, {
          status: 'completed',
          progress: 'Generation complete!',
          files: savedFiles,
        });

        return {
          status: 'completed',
          progress: 'Generation complete!',
          files: savedFiles,
        };
      }

      // Check if failed
      if (apiStatus === 'FAILED' || apiStatus === 'ERROR') {
        await updateTask(taskId, {
          status: 'failed',
          error: conv.message || 'Generation failed',
        });

        return {
          status: 'failed',
          error: conv.message || 'Generation failed',
        };
      }

      // Still processing - return status from API
      return {
        status: 'processing',
        progress: `Generating music... (${apiStatus || 'IN_PROGRESS'})`,
      };
    } catch (error) {
      console.error('[MusicGPT] Error checking status:', error);
      // Return cached status on error
      return {
        status: task.status,
        progress: task.progress,
      };
    }
  }

  // Return cached status (for mock mode or pending tasks)
  return {
    status: task.status,
    progress: task.progress,
    files: task.files,
    error: task.error,
  };
}

/**
 * Fetch conversion status from MusicGPT
 * Endpoint: GET /api/public/v1/byId?conversionType=MUSIC_AI&conversion_id={id}
 * Docs: https://docs.musicgpt.com/api-documentation/endpoint/getById
 */
async function fetchConversionStatus(conversionId: string): Promise<{
  success: boolean;
  conversion?: {
    status: string;
    message?: string;
    conversion_path_1?: string;
    conversion_path_2?: string;
    title?: string;
    lyrics?: string;
  };
} | null> {
  try {
    const url = new URL(`${MUSICGPT_API_URL}/api/public/v1/byId`);
    url.searchParams.set('conversionType', 'MUSIC_AI');
    url.searchParams.set('conversion_id', conversionId);

    console.log('[MusicGPT] Fetching status:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': MUSICGPT_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MusicGPT] Status check failed:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[MusicGPT] Status response:', JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('[MusicGPT] Status check error:', error);
    return null;
  }
}

/**
 * Return files with direct URLs (no local download - Vercel has read-only filesystem)
 */
async function downloadAndSaveFiles(
  files: { url: string }[],
  taskId: string,
  style: MusicStyle
): Promise<{ url: string; version: number }[]> {
  // On Vercel, we can't save files locally (read-only filesystem)
  // Return direct URLs instead
  return files.map((file, i) => ({
    url: file.url,
    version: i + 1,
  }));
}

// Sample MP3 URLs for mock mode (royalty-free Lo-Fi samples)
const MOCK_SAMPLE_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
];

/**
 * Simulate mock generation for development
 * Downloads sample MP3 files and saves them with proper naming
 */
async function simulateMockGeneration(taskId: string, style: MusicStyle): Promise<void> {
  const steps = [
    { delay: 1000, progress: 'Connecting to MusicGPT...' },
    { delay: 1500, progress: 'Analyzing style parameters...' },
    { delay: 2000, progress: 'Generating waveform...' },
    { delay: 2000, progress: 'Applying textures...' },
    { delay: 1500, progress: 'Mastering audio tracks...' },
    { delay: 1000, progress: 'Finalizing...' },
  ];

  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, step.delay));

    const task = await getTask(taskId);
    if (!task) return;

    await updateTask(taskId, {
      status: 'processing',
      progress: step.progress,
    });
  }

  // Download sample files and save them locally
  try {
    const savedFiles = await downloadAndSaveFiles(
      MOCK_SAMPLE_URLS.map(url => ({ url })),
      taskId,
      style
    );

    if (savedFiles.length > 0) {
      await updateTask(taskId, {
        status: 'completed',
        progress: 'Generation complete!',
        files: savedFiles,
      });
    } else {
      throw new Error('No files were saved');
    }
  } catch (error) {
    console.error('[Mock] Error in mock generation:', error);
    await updateTask(taskId, {
      status: 'failed',
      error: 'Mock generation failed - could not download sample files',
    });
  }
}

/**
 * Generate a unique task ID
 */
function generateTaskId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Clean up old tasks from cache
 */
export { cleanupOldTasks } from './taskCache';
