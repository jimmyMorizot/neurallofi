import type { MusicStyle, TextureType, GenerationStatus } from '@/types';
import { buildPrompt } from '@/types';
import { saveFile } from './filesystem';

// MusicGPT API Configuration - Real API endpoints
const MUSICGPT_API_URL = process.env.MUSICGPT_API_URL || 'https://api.musicgpt.com';
const MUSICGPT_API_KEY = process.env.MUSICGPT_API_KEY || '';

// In-memory storage for task status (in production, use Redis or similar)
const taskStore = new Map<string, {
  status: GenerationStatus;
  style: MusicStyle;
  progress?: string;
  files?: { url: string; version: number }[];
  error?: string;
  createdAt: Date;
  musicGptTaskId?: string;
  conversionId1?: string;
  conversionId2?: string;
}>();

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
  textures: TextureType[]
): Promise<{ taskId: string; eta: number }> {
  const prompt = buildPrompt(style, textures);

  // Generate a unique local task ID
  const taskId = generateTaskId();

  // Store initial task status
  taskStore.set(taskId, {
    status: 'pending',
    style,
    progress: 'Initializing generation...',
    createdAt: new Date(),
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
        make_instrumental: true,
        // lyrics: '', // Empty for instrumental
        // vocal_only: false,
        // voice_id: '',
        // webhook_url: '', // We'll poll instead
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MusicGPT API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Response format: { success, message, task_id, conversion_id_1, conversion_id_2, eta }
    if (!data.success) {
      throw new Error(data.message || 'MusicGPT API returned unsuccessful response');
    }

    // Update task with MusicGPT IDs
    taskStore.set(taskId, {
      ...taskStore.get(taskId)!,
      status: 'processing',
      progress: 'Generation started...',
      musicGptTaskId: data.task_id,
      conversionId1: data.conversion_id_1,
      conversionId2: data.conversion_id_2,
    });

    // Start polling for status using conversion IDs
    pollMusicGPTStatus(taskId, data.conversion_id_1, data.conversion_id_2, style);

    return {
      taskId,
      eta: data.eta || 120,
    };
  } catch (error) {
    taskStore.set(taskId, {
      ...taskStore.get(taskId)!,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Check the status of a generation task
 */
export async function checkStatus(taskId: string): Promise<{
  status: GenerationStatus;
  progress?: string;
  files?: { url: string; version: number }[];
  error?: string;
}> {
  const task = taskStore.get(taskId);

  if (!task) {
    return {
      status: 'failed',
      error: 'Task not found',
    };
  }

  return {
    status: task.status,
    progress: task.progress,
    files: task.files,
    error: task.error,
  };
}

/**
 * Poll MusicGPT API for conversion status
 * Uses: GET /api/public/v1/conversion/{conversionId}
 */
async function pollMusicGPTStatus(
  localTaskId: string,
  conversionId1: string,
  conversionId2: string,
  style: MusicStyle
): Promise<void> {
  const maxAttempts = 60; // 5 minutes with 5s interval
  let attempts = 0;

  const poll = async () => {
    attempts++;

    try {
      // Check both conversions
      const [result1, result2] = await Promise.all([
        fetchConversionStatus(conversionId1),
        fetchConversionStatus(conversionId2),
      ]);

      const task = taskStore.get(localTaskId);
      if (!task) return;

      // Check conversion status (completed, processing, failed, etc.)
      const conv1 = result1?.conversion;
      const conv2 = result2?.conversion;

      // Check if both are completed with audio URLs
      const file1Ready = conv1?.status === 'completed' && conv1?.audio_url;
      const file2Ready = conv2?.status === 'completed' && conv2?.audio_url;

      if (file1Ready && file2Ready && conv1?.audio_url && conv2?.audio_url) {
        // Download and save files
        const savedFiles = await downloadAndSaveFiles(
          [
            { url: conv1.audio_url },
            { url: conv2.audio_url },
          ],
          localTaskId,
          style
        );

        taskStore.set(localTaskId, {
          ...task,
          status: 'completed',
          progress: 'Generation complete!',
          files: savedFiles,
        });
      } else if (conv1?.status === 'failed' || conv2?.status === 'failed') {
        // Generation failed
        taskStore.set(localTaskId, {
          ...task,
          status: 'failed',
          error: conv1?.status_msg || conv2?.status_msg || 'Generation failed',
        });
      } else if (attempts < maxAttempts) {
        // Still processing
        const progressPercent = Math.min(Math.round((attempts / maxAttempts) * 100), 95);
        const statusMsg = conv1?.status_msg || conv2?.status_msg || `Generating music... (${progressPercent}%)`;
        taskStore.set(localTaskId, {
          ...task,
          status: 'processing',
          progress: statusMsg,
        });
        setTimeout(poll, 5000);
      } else {
        taskStore.set(localTaskId, {
          ...task,
          status: 'failed',
          error: 'Generation timed out',
        });
      }
    } catch (error) {
      const task = taskStore.get(localTaskId);
      if (task && attempts < maxAttempts) {
        // Retry on error
        setTimeout(poll, 5000);
      } else if (task) {
        taskStore.set(localTaskId, {
          ...task,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  };

  // Start polling after initial delay
  setTimeout(poll, 10000); // Wait 10s before first poll
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
    status_msg?: string;
    audio_url?: string;
    title?: string;
    lyrics?: string;
  };
} | null> {
  try {
    const url = new URL(`${MUSICGPT_API_URL}/api/public/v1/byId`);
    url.searchParams.set('conversionType', 'MUSIC_AI');
    url.searchParams.set('conversion_id', conversionId);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': MUSICGPT_API_KEY,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

/**
 * Download files from MusicGPT and save locally
 */
async function downloadAndSaveFiles(
  files: { url: string }[],
  taskId: string,
  style: MusicStyle
): Promise<{ url: string; version: number }[]> {
  const savedFiles: { url: string; version: number }[] = [];

  for (let i = 0; i < files.length; i++) {
    const version = i + 1;

    try {
      const response = await fetch(files[i].url);
      if (!response.ok) continue;

      const buffer = Buffer.from(await response.arrayBuffer());
      const localUrl = await saveFile(buffer, taskId, style, version);

      savedFiles.push({ url: localUrl, version });
    } catch (error) {
      console.error(`Failed to download file ${i + 1}:`, error);
    }
  }

  return savedFiles;
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

    const task = taskStore.get(taskId);
    if (!task) return;

    taskStore.set(taskId, {
      ...task,
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
      taskStore.set(taskId, {
        ...taskStore.get(taskId)!,
        status: 'completed',
        progress: 'Generation complete!',
        files: savedFiles,
      });
    } else {
      throw new Error('No files were saved');
    }
  } catch (error) {
    console.error('[Mock] Error in mock generation:', error);
    taskStore.set(taskId, {
      ...taskStore.get(taskId)!,
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
 * Clean up old tasks from memory
 */
export function cleanupOldTasks(): void {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const [taskId, task] of taskStore.entries()) {
    if (task.createdAt < oneHourAgo) {
      taskStore.delete(taskId);
    }
  }
}
