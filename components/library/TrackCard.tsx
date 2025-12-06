'use client';

import { Play, Pause } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Track, MusicStyle } from '@/types';
import { STYLE_CONFIG } from '@/types';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

// Badge color mapping based on style
const BADGE_COLORS: Record<MusicStyle, string> = {
  classic: 'badge-cyan',
  indian: 'badge-purple',
  african: 'badge-pink',
  asian: 'badge-blue',
  latino: 'badge-pink',
};

export function TrackCard({ track, isPlaying, onPlay, onPause }: TrackCardProps) {
  const styleConfig = STYLE_CONFIG[track.style];
  const badgeColor = BADGE_COLORS[track.style];

  return (
    <div
      className={cn(
        'track-card',
        isPlaying && 'playing'
      )}
    >
      {/* Title */}
      <div className="track-title">{track.title}</div>

      {/* Badges */}
      <div className="mb-4">
        <span className={cn('badge', badgeColor)}>
          {styleConfig.label.split(' ')[0]}
        </span>
        <span className="badge badge-muted">
          V{track.version}
        </span>
      </div>

      {/* Footer: Date + Status/Play */}
      <div className="flex justify-between items-center text-sm text-muted">
        <span>{formatDate(track.date)}</span>
        {isPlaying ? (
          <button
            onClick={onPause}
            className="text-pink hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            <Pause className="h-3 w-3" />
            <span>PLAYING</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="hover:text-cyan transition-colors flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            <span>Play</span>
          </button>
        )}
      </div>
    </div>
  );
}
