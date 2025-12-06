import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ensureDirectoryExists } from '@/lib/filesystem';

const MUSIC_DIR = path.join(process.cwd(), 'public/generated/music');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Security: only allow audio files
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.mp3')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP3, WAV, and OGG files are allowed.' },
        { status: 400 }
      );
    }

    // Generate unique filename for imported files
    const taskId = `import_${Date.now().toString(36)}`;
    const style = 'classic'; // Default style for imports
    const version = 1;
    const filename = `${taskId}_${style}_v${version}.mp3`;

    await ensureDirectoryExists();

    // Read file buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(MUSIC_DIR, filename);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      url: `/generated/music/${filename}`,
    });
  } catch (error) {
    console.error('Error importing file:', error);
    return NextResponse.json(
      { error: 'Failed to import file' },
      { status: 500 }
    );
  }
}
