'use client';

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  disabled,
}: PlayerControlsProps) {
  return (
    <div className="player-buttons">
      <button
        onClick={onPrevious}
        disabled={disabled}
        className={cn('player-btn', disabled && 'opacity-50 cursor-not-allowed')}
      >
        <SkipBack className="h-5 w-5" />
      </button>

      <button
        onClick={onPlayPause}
        disabled={disabled}
        className={cn('player-btn player-btn-main', disabled && 'opacity-50 cursor-not-allowed')}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6 ml-0.5" />
        )}
      </button>

      <button
        onClick={onNext}
        disabled={disabled}
        className={cn('player-btn', disabled && 'opacity-50 cursor-not-allowed')}
      >
        <SkipForward className="h-5 w-5" />
      </button>
    </div>
  );
}
