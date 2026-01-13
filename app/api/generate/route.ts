import { NextRequest, NextResponse } from 'next/server';
import { generateMusic } from '@/lib/musicgpt';
import type { GenerationRequest } from '@/types';

// Extended request type with optional user API key
interface ExtendedGenerationRequest extends GenerationRequest {
  userApiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtendedGenerationRequest = await request.json();

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
    const withVocals = body.withVocals || false;
    const customLyrics = body.customLyrics?.trim().slice(0, 280) || undefined;
    const userApiKey = body.userApiKey?.trim() || undefined;

    // Generate music (pass user API key if provided)
    const result = await generateMusic(body.style, textures, withVocals, customLyrics, userApiKey);

    return NextResponse.json({
      taskId: result.taskId,
      eta: result.eta,
      mockMode: result.mockMode || false,
      conversionId: result.conversionId,
      style: body.style,
    });
  } catch (error) {
    console.error('Error generating music:', error);

    // Check for specific error types
    const errorMessage = error instanceof Error ? error.message : 'Failed to start generation';
    const isCreditsError = errorMessage.toLowerCase().includes('credit') ||
                          errorMessage.toLowerCase().includes('quota') ||
                          errorMessage.toLowerCase().includes('limit') ||
                          errorMessage.toLowerCase().includes('insufficient') ||
                          errorMessage.includes('402') ||
                          errorMessage.includes('429') ||
                          errorMessage.includes('500'); // MusicGPT returns 500 when credits are exhausted

    return NextResponse.json(
      {
        error: errorMessage,
        errorType: isCreditsError ? 'CREDITS_EXHAUSTED' : 'GENERATION_ERROR'
      },
      { status: isCreditsError ? 402 : 500 }
    );
  }
}
