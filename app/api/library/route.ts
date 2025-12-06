import { NextResponse } from 'next/server';
import { getAllCompletedTracks } from '@/lib/taskCache';

export async function GET() {
  try {
    // On Vercel, we can't scan filesystem (read-only)
    // Return tracks from completed generation tasks in memory
    const tracks = await getAllCompletedTracks();

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json([]); // Return empty array on error
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
