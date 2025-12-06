import type { MusicStyle, TextureType, GenerationStatus } from '@/types';
import { buildPrompt } from '@/types';
import { saveFile } from './filesystem';

// MusicGPT API Configuration
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
}>();

/**
 * Generate music using MusicGPT API
 */
export async function generateMusic(
  style: MusicStyle,
  textures: TextureType[]
): Promise<{ taskId: string; eta: number }> {
  const prompt = buildPrompt(style, textures);

  // Generate a unique task ID
  const taskId = generateTaskId();

  // Store initial task status
  taskStore.set(taskId, {
    status: 'pending',
    style,
    progress: 'Initializing generation...',
    createdAt: new Date(),
  });

  // If no API key, use mock mode
  if (!MUSICGPT_API_KEY) {
    console.log('[MusicGPT Mock] Starting generation with prompt:', prompt);

    // Simulate async generation
    simulateMockGeneration(taskId, style);

    return { taskId, eta: 30 }; // Mock ETA of 30 seconds
  }

  try {
    const response = await fetch(`${MUSICGPT_API_URL}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MUSICGPT_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        musicStyle: getStyleLabel(style),
        makeInstrumental: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MusicGPT API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Update task with MusicGPT task ID
    taskStore.set(taskId, {
      ...taskStore.get(taskId)!,
      status: 'processing',
      progress: 'Generation started...',
    });

    // Start polling for status
    pollMusicGPTStatus(taskId, data.taskId, style);

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
 * Poll MusicGPT API for task status
 */
async function pollMusicGPTStatus(
  localTaskId: string,
  musicGptTaskId: string,
  style: MusicStyle
): Promise<void> {
  const maxAttempts = 60; // 5 minutes with 5s interval
  let attempts = 0;

  const poll = async () => {
    attempts++;

    try {
      const response = await fetch(`${MUSICGPT_API_URL}/v1/status/${musicGptTaskId}`, {
        headers: {
          'Authorization': `Bearer ${MUSICGPT_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'completed' && data.files) {
        // Download and save files
        const savedFiles = await downloadAndSaveFiles(data.files, localTaskId, style);

        taskStore.set(localTaskId, {
          ...taskStore.get(localTaskId)!,
          status: 'completed',
          progress: 'Generation complete!',
          files: savedFiles,
        });
      } else if (data.status === 'failed') {
        taskStore.set(localTaskId, {
          ...taskStore.get(localTaskId)!,
          status: 'failed',
          error: data.error || 'Generation failed',
        });
      } else if (attempts < maxAttempts) {
        taskStore.set(localTaskId, {
          ...taskStore.get(localTaskId)!,
          status: 'processing',
          progress: data.progress || `Processing... (${Math.round((attempts / maxAttempts) * 100)}%)`,
        });
        setTimeout(poll, 5000);
      } else {
        taskStore.set(localTaskId, {
          ...taskStore.get(localTaskId)!,
          status: 'failed',
          error: 'Generation timed out',
        });
      }
    } catch (error) {
      taskStore.set(localTaskId, {
        ...taskStore.get(localTaskId)!,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  setTimeout(poll, 5000);
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

/**
 * Simulate mock generation for development
 */
async function simulateMockGeneration(taskId: string, style: MusicStyle): Promise<void> {
  const steps = [
    { delay: 2000, progress: 'Connecting to MusicGPT...' },
    { delay: 3000, progress: 'Analyzing style parameters...' },
    { delay: 4000, progress: 'Generating waveform...' },
    { delay: 5000, progress: 'Applying textures...' },
    { delay: 3000, progress: 'Mastering audio tracks...' },
    { delay: 2000, progress: 'Finalizing...' },
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

  // Complete with mock files
  taskStore.set(taskId, {
    ...taskStore.get(taskId)!,
    status: 'completed',
    progress: 'Generation complete!',
    files: [
      { url: `/generated/music/${taskId}_${style}_v1.mp3`, version: 1 },
      { url: `/generated/music/${taskId}_${style}_v2.mp3`, version: 2 },
    ],
  });
}

/**
 * Generate a unique task ID
 */
function generateTaskId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Get the display label for a style
 */
function getStyleLabel(style: MusicStyle): string {
  const labels: Record<MusicStyle, string> = {
    classic: 'Classic Lo-fi',
    indian: 'Indian Lo-fi',
    african: 'African Lo-fi',
    asian: 'Asian Lo-fi',
    latino: 'Latino Lo-fi',
  };
  return labels[style];
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
