import { NextRequest, NextResponse } from 'next/server';
import { uploadTrackToBlob } from '@/lib/blob';
import type { MusicStyle } from '@/types';

interface UploadRequest {
  taskId: string;
  style: MusicStyle;
  files: { url: string; version: number }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();

    if (!body.taskId || !body.style || !body.files?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: taskId, style, files' },
        { status: 400 }
      );
    }

    // Upload each file to Vercel Blob
    const uploadedTracks = await Promise.all(
      body.files.map(async (file) => {
        const result = await uploadTrackToBlob(
          body.taskId,
          body.style,
          file.version,
          file.url
        );
        return {
          id: `${body.taskId}_v${file.version}`,
          taskId: body.taskId,
          title: `${body.style.charAt(0).toUpperCase() + body.style.slice(1)} Lo-Fi #${body.taskId.slice(0, 4)}`,
          style: body.style,
          version: file.version,
          filename: result.filename,
          url: result.url,
        };
      })
    );

    console.log(`[Upload] Successfully uploaded ${uploadedTracks.length} tracks for task ${body.taskId}`);

    return NextResponse.json({
      success: true,
      tracks: uploadedTracks,
    });
  } catch (error) {
    console.error('Error uploading tracks:', error);
    return NextResponse.json(
      { error: 'Failed to upload tracks' },
      { status: 500 }
    );
  }
}
