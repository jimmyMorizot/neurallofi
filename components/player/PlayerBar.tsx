'use client';

import { PlayerControls } from './PlayerControls';
import { ProgressSeek } from './ProgressSeek';
import { VolumeControl } from './VolumeControl';
import { Visualizer } from './Visualizer';
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
  getFrequencyData?: () => number[];
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
  getFrequencyData,
}: PlayerBarProps) {
  const hasTrack = currentTrack !== null;

  return (
    <footer className="player-bar">
      {/* Left: Track Info */}
      <div className="player-info">
        {hasTrack ? (
          <>
            <div className="player-info-title">{currentTrack.title}</div>
            <div className="player-info-status">
              {isPlaying ? 'Playing...' : 'Paused'}
            </div>
          </>
        ) : (
          <div className="text-muted text-sm">No track selected</div>
        )}
      </div>

      {/* Center: Controls + Progress */}
      <div className="player-controls">
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

      {/* Right: Volume + Visualizer */}
      <div className="player-volume hidden lg:flex">
        <Visualizer isPlaying={isPlaying && hasTrack} getFrequencyData={getFrequencyData} />
        <VolumeControl
          volume={volume}
          onVolumeChange={onVolumeChange}
          disabled={!hasTrack}
        />
      </div>
    </footer>
  );
}
