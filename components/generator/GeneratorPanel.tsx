'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StyleSelector } from './StyleSelector';
import { TextureSelector } from './TextureSelector';
import { GenerateButton } from './GenerateButton';
import { StatusConsole } from './StatusConsole';
import { useGeneration } from '@/hooks/useGeneration';
import type { MusicStyle, TextureType } from '@/types';

interface GeneratorPanelProps {
  onGenerationComplete?: () => void;
}

export function GeneratorPanel({ onGenerationComplete }: GeneratorPanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle>('classic');
  const [selectedTextures, setSelectedTextures] = useState<TextureType[]>([]);

  const {
    generate,
    status,
    progress,
    messages,
    eta,
  } = useGeneration({ onComplete: onGenerationComplete });

  const handleTextureToggle = useCallback((texture: TextureType) => {
    setSelectedTextures((prev) =>
      prev.includes(texture)
        ? prev.filter((t) => t !== texture)
        : [...prev, texture]
    );
  }, []);

  const handleGenerate = useCallback(() => {
    generate({
      style: selectedStyle,
      textures: selectedTextures,
    });
  }, [generate, selectedStyle, selectedTextures]);

  const isLoading = status === 'pending' || status === 'processing';

  return (
    <Card className="glass border-white/[0.08] bg-black/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-[var(--neon-cyan)] font-mono text-lg font-normal">
          // GENERATE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StyleSelector
          selected={selectedStyle}
          onSelect={setSelectedStyle}
          disabled={isLoading}
        />

        <TextureSelector
          selected={selectedTextures}
          onToggle={handleTextureToggle}
          disabled={isLoading}
        />

        <GenerateButton
          onClick={handleGenerate}
          isLoading={isLoading}
        />

        {isLoading && eta > 0 && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              ETA: {eta}s remaining
            </p>
          </div>
        )}

        <StatusConsole messages={messages} showCursor={!isLoading} />
      </CardContent>
    </Card>
  );
}
