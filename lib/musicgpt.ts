import type { MusicStyle, TextureType, GenerationStatus } from '@/types';
import { buildPrompt } from '@/types';

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
): Promise<{ taskId: string; eta: number; mockMode?: boolean; conversionId?: string }> {
  const prompt = buildPrompt(style, textures);

  // Generate a unique local task ID
  const taskId = generateTaskId();

  // Check if we should use mock mode
  const apiKey = MUSICGPT_API_KEY?.trim() || '';
  const isValidApiKey = apiKey.length > 20 && !apiKey.includes('your_api_key');

  console.log('[MusicGPT] API Key status:', isValidApiKey ? 'Valid key detected' : 'No valid key - using MOCK mode');

  // If no valid API key, use mock mode - client will handle simulation
  if (!isValidApiKey) {
    console.log('[MusicGPT Mock] Returning mock mode for client-side simulation');
    return { taskId, eta: 10, mockMode: true };
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

    // Return conversion ID to client for stateless polling
    return {
      taskId,
      eta: data.eta || 120,
      conversionId: data.conversion_id_1,
    };
  } catch (error) {
    console.error('[MusicGPT] Generation error:', error);
    throw error;
  }
}

/**
 * Check the status of a generation task
 * Directly queries MusicGPT API - stateless, no cache needed
 */
export async function checkStatus(conversionId: string): Promise<{
  status: GenerationStatus;
  progress?: string;
  files?: { url: string; version: number }[];
  error?: string;
}> {
  if (!conversionId) {
    return {
      status: 'failed',
      error: 'No conversion ID provided',
    };
  }

  try {
    const result = await fetchConversionStatus(conversionId);
    const conv = result?.conversion;

    if (!conv) {
      return {
        status: 'processing',
        progress: 'Checking generation status...',
      };
    }

    const apiStatus = conv.status?.toUpperCase();
    console.log('[MusicGPT] Direct status check:', apiStatus);

    // Check if completed (only return first version)
    if (apiStatus === 'COMPLETED' && conv.conversion_path_1) {
      console.log('[MusicGPT] Generation complete!');

      return {
        status: 'completed',
        progress: 'Generation complete!',
        files: [
          { url: conv.conversion_path_1, version: 1 },
        ],
      };
    }

    // Check if failed
    if (apiStatus === 'FAILED' || apiStatus === 'ERROR') {
      return {
        status: 'failed',
        error: conv.message || 'Generation failed',
      };
    }

    // Still processing
    return {
      status: 'processing',
      progress: `Generating music... (${apiStatus || 'IN_PROGRESS'})`,
    };
  } catch (error) {
    console.error('[MusicGPT] Error checking status:', error);
    return {
      status: 'processing',
      progress: 'Checking status...',
    };
  }
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
 * Generate a unique task ID
 */
function generateTaskId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Mock sample URLs for client-side simulation
export const MOCK_SAMPLE_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
];
