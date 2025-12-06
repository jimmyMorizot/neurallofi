import { NextRequest, NextResponse } from 'next/server';
import { deleteFile, fileExists } from '@/lib/filesystem';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;

    // Security: only allow .mp3 files
    if (!filename.endsWith('.mp3')) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Security: prevent path traversal
    if (filename.includes('/') || filename.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Check if file exists
    const exists = await fileExists(filename);
    if (!exists) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Delete the file
    const deleted = await deleteFile(filename);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete track' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    );
  }
}
