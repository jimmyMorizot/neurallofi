import { NextRequest, NextResponse } from 'next/server';
import { checkStatus } from '@/lib/musicgpt';
import type { StatusResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const status = await checkStatus(taskId);

    const response: StatusResponse = {
      status: status.status,
      progress: status.progress,
      files: status.files,
      error: status.error,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic';
