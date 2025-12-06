import { NextResponse } from 'next/server';

// Import is disabled on Vercel (read-only filesystem)
export async function POST() {
  return NextResponse.json(
    { error: 'Import is not available on cloud deployment. Use the AI generator instead!' },
    { status: 503 }
  );
}
