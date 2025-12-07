import { NextResponse } from 'next/server';
import { listTracksFromBlob } from '@/lib/blob';

export async function GET() {
  try {
    // List all tracks from Vercel Blob Storage
    const tracks = await listTracksFromBlob();

    return NextResponse.json(tracks);
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json([]); // Return empty array on error
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
