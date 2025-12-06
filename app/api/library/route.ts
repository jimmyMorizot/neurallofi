import { NextResponse } from 'next/server';
import { scanMusicDirectory } from '@/lib/filesystem';

export async function GET() {
  try {
    const tracks = await scanMusicDirectory();

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library' },
      { status: 500 }
    );
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
