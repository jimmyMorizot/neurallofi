'use client';

import { Music } from 'lucide-react';
import { TrackCard } from './TrackCard';
import type { Track } from '@/types';

interface LibraryProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onPause: () => void;
  isLoading?: boolean;
}

export function Library({
  tracks,
  currentTrackId,
  isPlaying,
  onPlay,
  onPause,
  isLoading,
}: LibraryProps) {
  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="animate-pulse text-muted">
          Loading library...
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Music className="h-12 w-12" />
        </div>
        <p>No tracks yet</p>
        <p className="text-sm mt-1">Generate your first Lo-Fi track!</p>
      </div>
    );
  }

  return (
    <div className="tracks-grid">
      {tracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          isPlaying={currentTrackId === track.id && isPlaying}
          onPlay={() => onPlay(track)}
          onPause={onPause}
        />
      ))}
    </div>
  );
}
