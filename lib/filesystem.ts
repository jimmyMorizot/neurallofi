import { promises as fs } from 'fs';
import path from 'path';
import type { Track, MusicStyle } from '@/types';
import { formatFileSize } from './utils';

const MUSIC_DIR = path.join(process.cwd(), 'public/generated/music');

/**
 * Parse a music filename to extract metadata
 * Format: {taskId}_{style}_v{version}.mp3
 */
export function parseFilename(filename: string): {
  taskId: string;
  style: MusicStyle;
  version: number;
} | null {
  const match = filename.match(/^(.+)_(.+)_v(\d+)\.mp3$/);
  if (!match) return null;

  const [, taskId, style, version] = match;
  const validStyles: MusicStyle[] = ['classic', 'indian', 'african', 'asian', 'latino'];

  if (!validStyles.includes(style as MusicStyle)) return null;

  return {
    taskId,
    style: style as MusicStyle,
    version: parseInt(version, 10),
  };
}

/**
 * Generate a title from track metadata
 */
export function generateTitle(style: MusicStyle, taskId: string, version: number): string {
  const styleLabels: Record<MusicStyle, string> = {
    classic: 'Classic',
    indian: 'Indian',
    african: 'African',
    asian: 'Asian',
    latino: 'Latino',
  };
  return `${styleLabels[style]} Lo-Fi #${taskId.slice(0, 4)} (v${version})`;
}

/**
 * Ensure the music directory exists
 */
export async function ensureDirectoryExists(): Promise<void> {
  try {
    await fs.access(MUSIC_DIR);
  } catch {
    await fs.mkdir(MUSIC_DIR, { recursive: true });
  }
}

/**
 * Scan the music directory and return all tracks
 */
export async function scanMusicDirectory(): Promise<Track[]> {
  try {
    await ensureDirectoryExists();
    const files = await fs.readdir(MUSIC_DIR);
    const tracks: Track[] = [];

    for (const filename of files) {
      if (!filename.endsWith('.mp3')) continue;

      const parsed = parseFilename(filename);
      if (!parsed) continue;

      const filePath = path.join(MUSIC_DIR, filename);

      try {
        const stats = await fs.stat(filePath);

        tracks.push({
          id: `${parsed.taskId}_v${parsed.version}`,
          filename,
          url: `/generated/music/${filename}`,
          taskId: parsed.taskId,
          style: parsed.style,
          version: parsed.version,
          title: generateTitle(parsed.style, parsed.taskId, parsed.version),
          date: stats.mtime,
          size: formatFileSize(stats.size),
        });
      } catch {
        // Skip files that can't be read
        continue;
      }
    }

    // Sort by date descending (newest first)
    tracks.sort((a, b) => b.date.getTime() - a.date.getTime());

    return tracks;
  } catch (error) {
    console.error('Error scanning music directory:', error);
    return [];
  }
}

/**
 * Save a file to the music directory
 */
export async function saveFile(
  buffer: Buffer,
  taskId: string,
  style: MusicStyle,
  version: number
): Promise<string> {
  await ensureDirectoryExists();

  const filename = `${taskId}_${style}_v${version}.mp3`;
  const filePath = path.join(MUSIC_DIR, filename);

  await fs.writeFile(filePath, buffer);

  return `/generated/music/${filename}`;
}

/**
 * Delete a track file
 */
export async function deleteFile(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(MUSIC_DIR, filename);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a track file exists
 */
export async function fileExists(filename: string): Promise<boolean> {
  try {
    const filePath = path.join(MUSIC_DIR, filename);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
