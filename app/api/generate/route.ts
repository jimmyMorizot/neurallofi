import { NextRequest, NextResponse } from 'next/server';
import { generateMusic } from '@/lib/musicgpt';
import type { GenerationRequest, GenerationResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();

    // Validate request
    if (!body.style) {
      return NextResponse.json(
        { error: 'Style is required' },
        { status: 400 }
      );
    }

    const validStyles = ['classic', 'indian', 'african', 'asian', 'latino'];
    if (!validStyles.includes(body.style)) {
      return NextResponse.json(
        { error: 'Invalid style' },
        { status: 400 }
      );
    }

    const validTextures = ['rain', 'vinyl', 'city', 'typing'];
    const textures = (body.textures || []).filter((t) => validTextures.includes(t));

    // Generate music
    const result = await generateMusic(body.style, textures);

    const response: GenerationResponse = {
      taskId: result.taskId,
      eta: result.eta,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating music:', error);
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    );
  }
}
