import { put, list, del } from '@vercel/blob';
import type { MusicStyle } from '@/types';

/**
 * Vercel Blob Storage utilities for Neural Lofi
 * Stores generated MP3 files with naming convention: {taskId}_{style}_v{version}.mp3
 */

export interface BlobTrack {
  id: string;
  taskId: string;
  title: string;
  style: MusicStyle;
  version: number;
  filename: string;
  url: string;
  size: string;
  date: Date;
}

/**
 * Download MP3 from MusicGPT URL and upload to Vercel Blob
 */
export async function uploadTrackToBlob(
  taskId: string,
  style: MusicStyle,
  version: number,
  sourceUrl: string
): Promise<{ url: string; filename: string }> {
  const filename = `${taskId}_${style}_v${version}.mp3`;

  try {
    // Fetch the MP3 from MusicGPT
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch MP3: ${response.status}`);
    }

    const blob = await response.blob();

    // Upload to Vercel Blob
    const result = await put(filename, blob, {
      access: 'public',
      contentType: 'audio/mpeg',
    });

    console.log(`[Blob] Uploaded ${filename} to ${result.url}`);

    return {
      url: result.url,
      filename,
    };
  } catch (error) {
    console.error(`[Blob] Error uploading ${filename}:`, error);
    throw error;
  }
}

/**
 * List all tracks from Vercel Blob storage
 */
export async function listTracksFromBlob(): Promise<BlobTrack[]> {
  try {
    const { blobs } = await list();

    // Filter and parse MP3 files matching our naming convention
    const tracks: BlobTrack[] = blobs
      .filter((blob) => blob.pathname.endsWith('.mp3'))
      .map((blob) => {
        // Parse filename: {taskId}_{style}_v{version}.mp3
        const filename = blob.pathname;
        const match = filename.match(/^([a-z0-9]+)_([a-z]+)_v(\d+)\.mp3$/);

        if (!match) {
          console.warn(`[Blob] Skipping unrecognized file: ${filename}`);
          return null;
        }

        const [, taskId, style, versionStr] = match;
        const version = parseInt(versionStr, 10);

        return {
          id: `${taskId}_v${version}`,
          taskId,
          title: `${style.charAt(0).toUpperCase() + style.slice(1)} Lo-Fi #${taskId.slice(0, 4)}`,
          style: style as MusicStyle,
          version,
          filename,
          url: blob.url,
          size: formatFileSize(blob.size),
          date: new Date(blob.uploadedAt),
        };
      })
      .filter((track): track is BlobTrack => track !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return tracks;
  } catch (error) {
    console.error('[Blob] Error listing tracks:', error);
    return [];
  }
}

/**
 * Delete a track from Vercel Blob storage
 */
export async function deleteTrackFromBlob(url: string): Promise<boolean> {
  try {
    await del(url);
    console.log(`[Blob] Deleted: ${url}`);
    return true;
  } catch (error) {
    console.error(`[Blob] Error deleting ${url}:`, error);
    return false;
  }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
