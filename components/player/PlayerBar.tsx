'use client';

import { PlayerControls } from './PlayerControls';
import { ProgressSeek } from './ProgressSeek';
import { VolumeControl } from './VolumeControl';
import { Visualizer } from './Visualizer';
import { cn } from '@/lib/utils';
import type { Track } from '@/types';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (progress: number) => void;
  onVolumeChange: (volume: number) => void;
}

export function PlayerBar({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
}: PlayerBarProps) {
  const hasTrack = currentTrack !== null;

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'h-[var(--player-height)] bg-[rgba(10,10,15,0.95)]',
        'backdrop-blur-xl border-t border-white/[0.08]',
        'grid grid-cols-[1fr_auto] md:grid-cols-[20%_1fr_20%] items-center',
        'px-4 md:px-8'
      )}
    >
      {/* Track Info */}
      <div className="flex flex-col min-w-0 col-span-2 md:col-span-1 mb-2 md:mb-0">
        {hasTrack ? (
          <>
            <div className="font-bold text-sm truncate">
              {currentTrack.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--neon-cyan)]">
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isPlaying
                    ? 'bg-[var(--neon-cyan)] shadow-[0_0_5px_var(--neon-cyan)]'
                    : 'bg-muted-foreground'
                )}
              />
              {isPlaying ? 'PLAYING' : 'PAUSED'}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            No track selected
          </div>
        )}
      </div>

      {/* Controls & Progress */}
      <div className="flex flex-col items-center gap-2 w-full max-w-[600px] mx-auto col-span-2 md:col-span-1">
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onPrevious={onPrevious}
          onNext={onNext}
          disabled={!hasTrack}
        />
        <ProgressSeek
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          disabled={!hasTrack}
        />
      </div>

      {/* Visualizer & Volume (hidden on mobile) */}
      <div className="hidden md:flex justify-end items-center gap-4">
        <Visualizer isPlaying={isPlaying && hasTrack} />
        <VolumeControl
          volume={volume}
          onVolumeChange={onVolumeChange}
          disabled={!hasTrack}
        />
      </div>
    </footer>
  );
}
