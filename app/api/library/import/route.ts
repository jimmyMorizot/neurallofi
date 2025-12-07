import { NextRequest, NextResponse } from 'next/server';
import { importTrackToBlob } from '@/lib/blob';

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('audio/') && !file.name.endsWith('.mp3')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP3 files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Vercel Blob
    const result = await importTrackToBlob(buffer, file.name);

    // Build track info
    const track = {
      id: `${result.taskId}_v1`,
      taskId: result.taskId,
      title: file.name.replace(/\.mp3$/i, ''),
      style: 'imported',
      version: 1,
      filename: result.filename,
      url: result.url,
    };

    console.log(`[Import] Successfully imported: ${file.name} -> ${result.filename}`);

    return NextResponse.json({
      success: true,
      track,
    });
  } catch (error) {
    console.error('Error importing track:', error);
    return NextResponse.json(
      { error: 'Failed to import track' },
      { status: 500 }
    );
  }
}
