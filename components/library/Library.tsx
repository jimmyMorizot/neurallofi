'use client';

import { Music } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">
          Loading library...
        </div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Music className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No tracks yet</p>
        <p className="text-xs mt-1">Generate your first Lo-Fi track!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <h2 className="text-lg font-light tracking-widest text-muted-foreground">
          // LIBRARY_DATABASE
        </h2>
        <div className="text-sm text-muted-foreground">
          {tracks.length} Track{tracks.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Tracks Grid */}
      <ScrollArea className="flex-1 -mx-1 px-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
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
      </ScrollArea>
    </div>
  );
}
