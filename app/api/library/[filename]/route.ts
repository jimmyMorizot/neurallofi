import { NextRequest, NextResponse } from 'next/server';
import { deleteTrackFromBlob } from '@/lib/blob';

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

    // Get blob URL from query params (needed for Vercel Blob deletion)
    const blobUrl = request.nextUrl.searchParams.get('url');

    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Blob URL is required' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    const deleted = await deleteTrackFromBlob(blobUrl);

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
