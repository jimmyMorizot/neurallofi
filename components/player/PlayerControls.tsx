'use client';

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={disabled}
        className="text-muted-foreground hover:text-white hover:bg-transparent"
      >
        <SkipBack className="h-5 w-5" />
      </Button>

      <Button
        size="icon"
        onClick={onPlayPause}
        disabled={disabled}
        className={cn(
          'w-10 h-10 rounded-full bg-white text-black',
          'hover:bg-[var(--neon-cyan)] hover:shadow-[0_0_15px_var(--neon-cyan)]',
          'transition-all duration-200',
          'disabled:opacity-50'
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={disabled}
        className="text-muted-foreground hover:text-white hover:bg-transparent"
      >
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>
  );
}
