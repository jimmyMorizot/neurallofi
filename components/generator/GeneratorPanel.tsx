'use client';

import { useState, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
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
  const [withVocals, setWithVocals] = useState(false);
  const [customLyrics, setCustomLyrics] = useState('');

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
      withVocals,
      customLyrics: withVocals && customLyrics.trim() ? customLyrics.trim() : undefined,
    });
  }, [generate, selectedStyle, selectedTextures, withVocals, customLyrics]);

  const isLoading = status === 'pending' || status === 'processing';

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Style Selection */}
      <StyleSelector
        selected={selectedStyle}
        onSelect={setSelectedStyle}
        disabled={isLoading}
      />

      {/* Texture Selection */}
      <TextureSelector
        selected={selectedTextures}
        onToggle={handleTextureToggle}
        disabled={isLoading}
      />

      {/* Vocals Toggle */}
      <div>
        <div className="section-title">Vocals</div>
        <button
          onClick={() => setWithVocals(!withVocals)}
          disabled={isLoading}
          className={`vocal-toggle ${withVocals ? 'active' : ''}`}
        >
          {withVocals ? (
            <>
              <Mic className="h-4 w-4" />
              <span>With AI Vocals</span>
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4" />
              <span>Instrumental Only</span>
            </>
          )}
        </button>

        {/* Custom Lyrics (visible when vocals enabled) */}
        {withVocals && (
          <div className="lyrics-input-wrapper">
            <textarea
              value={customLyrics}
              onChange={(e) => setCustomLyrics(e.target.value)}
              placeholder="Write your own lyrics here... (leave empty for AI-generated lyrics)"
              disabled={isLoading}
              className="lyrics-input"
              rows={3}
              maxLength={280}
            />
            <span className="lyrics-counter">{customLyrics.length}/280</span>
          </div>
        )}
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex-1" />

      {/* Generate Button */}
      <GenerateButton
        onClick={handleGenerate}
        isLoading={isLoading}
      />

      {/* Progress info */}
      {isLoading && eta > 0 && (
        <div className="text-center">
          <div className="progress-bar mb-2">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted">
            ETA: {eta}s remaining
          </p>
        </div>
      )}

      {/* Console */}
      <StatusConsole messages={messages} showCursor={!isLoading} />
    </div>
  );
}
