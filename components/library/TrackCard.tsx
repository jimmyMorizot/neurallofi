'use client';

import { useState } from 'react';
import { Play, Pause, Download, Heart, Trash2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Track, MusicStyle } from '@/types';
import { STYLE_CONFIG } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onPause: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

// Badge color mapping based on style
const BADGE_COLORS: Record<MusicStyle, string> = {
  classic: 'badge-cyan',
  indian: 'badge-purple',
  african: 'badge-pink',
  asian: 'badge-blue',
  latino: 'badge-pink',
  imported: 'badge-gray',
};

export function TrackCard({
  track,
  isPlaying,
  isFavorite,
  onPlay,
  onPause,
  onToggleFavorite,
  onDelete,
}: TrackCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const styleConfig = STYLE_CONFIG[track.style];
  const badgeColor = BADGE_COLORS[track.style];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
  };

  return (
    <div
      className={cn(
        'track-card',
        isPlaying && 'playing'
      )}
    >
      {/* Header: Title + Favorite */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="track-title flex-1">{track.title}</div>
        <button
          onClick={onToggleFavorite}
          className={cn(
            'shrink-0 transition-colors',
            isFavorite ? 'text-pink' : 'text-muted hover:text-pink'
          )}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
        </button>
      </div>

      {/* Badges */}
      <div className="mb-4">
        <span className={cn('badge', badgeColor)}>
          {styleConfig.label.split(' ')[0]}
        </span>
        <span className="badge badge-muted">
          V{track.version}
        </span>
      </div>

      {/* Footer: Date + Actions */}
      <div className="flex justify-between items-center text-sm text-muted">
        <span>{formatDate(track.date)}</span>
        <div className="flex items-center gap-3">
          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="hover:text-red-400 transition-colors"
            title="Delete track"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          {/* Download button */}
          <a
            href={track.url}
            download={track.filename}
            className="hover:text-blue transition-colors"
            title="Download MP3"
          >
            <Download className="h-3 w-3" />
          </a>
          {/* Play/Pause button */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="delete-dialog sm:max-w-[400px]">
          <DialogHeader className="relative z-10">
            <DialogTitle className="flex items-center gap-3 text-white text-lg">
              <div className="p-2 bg-pink/20 rounded-lg">
                <Trash2 className="h-5 w-5 text-pink drop-shadow-[0_0_6px_var(--pink-neon)]" />
              </div>
              <span className="tracking-wide">DELETE_TRACK</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-4 text-sm leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-cyan font-semibold drop-shadow-[0_0_4px_var(--cyan-ice)]">
                &quot;{track.title}&quot;
              </span>
              ?
              <br />
              <span className="text-xs opacity-60 mt-2 block">
                ⚠ This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3 mt-6">
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="btn-cancel flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="btn-delete flex-1"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
