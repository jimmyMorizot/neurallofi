'use client';

import { useRef } from 'react';
import { Music, Upload } from 'lucide-react';
import { TrackCard } from './TrackCard';
import type { Track, MusicStyle } from '@/types';
import { STYLE_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface LibraryProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onPause: () => void;
  onDelete: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  onToggleFavorite: (trackId: string) => void;
  onImport: (file: File) => Promise<boolean>;
  isLoading?: boolean;
  isImporting?: boolean;
  showFavoritesOnly?: boolean;
}

const CATEGORY_ORDER: MusicStyle[] = ['classic', 'indian', 'african', 'asian', 'latino'];

const SECTION_COLORS: Record<MusicStyle, string> = {
  classic: 'section-cyan',
  indian: 'section-purple',
  african: 'section-pink',
  asian: 'section-blue',
  latino: 'section-pink',
};

export function Library({
  tracks,
  currentTrackId,
  isPlaying,
  onPlay,
  onPause,
  onDelete,
  isFavorite,
  onToggleFavorite,
  onImport,
  isLoading,
  isImporting,
  showFavoritesOnly = false,
}: LibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImport(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter by favorites if needed
  const displayTracks = showFavoritesOnly
    ? tracks.filter((t) => isFavorite(t.id))
    : tracks;

  // Group by style
  const tracksByStyle = displayTracks.reduce((acc, track) => {
    if (!acc[track.style]) acc[track.style] = [];
    acc[track.style].push(track);
    return acc;
  }, {} as Record<MusicStyle, Track[]>);

  const categoriesWithTracks = CATEGORY_ORDER.filter(
    (style) => tracksByStyle[style]?.length > 0
  );

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="animate-pulse text-muted">Loading library...</div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Music className="h-12 w-12" /></div>
        <p>No tracks yet</p>
        <p className="text-sm mt-1">Generate your first Lo-Fi track!</p>
        <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="import-btn mt-6">
          <Upload className={cn('h-4 w-4', isImporting && 'animate-pulse')} />
          {isImporting ? 'Importing...' : 'Import MP3'}
        </button>
        <input ref={fileInputRef} type="file" accept="audio/mpeg,audio/mp3,.mp3" onChange={handleFileSelect} className="hidden" />
      </div>
    );
  }

  if (showFavoritesOnly && displayTracks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Music className="h-12 w-12" /></div>
        <p>No favorite tracks</p>
        <p className="text-sm mt-1">Click the heart to add favorites!</p>
      </div>
    );
  }

  return (
    <div className="library-container">
      <input ref={fileInputRef} type="file" accept="audio/mpeg,audio/mp3,.mp3" onChange={handleFileSelect} className="hidden" />

      <div className="library-header">
        <span className="text-sm text-muted">{displayTracks.length} track{displayTracks.length !== 1 ? 's' : ''}</span>
        <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="import-btn">
          <Upload className={cn('h-4 w-4', isImporting && 'animate-pulse')} />
          {isImporting ? 'Importing...' : 'Import MP3'}
        </button>
      </div>

      <div className="library-sections">
        {categoriesWithTracks.map((style) => {
          const styleTracks = tracksByStyle[style];
          const config = STYLE_CONFIG[style];
          return (
            <section key={style} className="library-section">
              <div className={cn('section-header', SECTION_COLORS[style])}>
                <span className="section-icon">{config.icon}</span>
                <h3 className="section-name">{config.label}</h3>
                <span className="section-count">{styleTracks.length}</span>
              </div>
              <div className="tracks-grid">
                {styleTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isPlaying={currentTrackId === track.id && isPlaying}
                    isFavorite={isFavorite(track.id)}
                    onPlay={() => onPlay(track)}
                    onPause={onPause}
                    onToggleFavorite={() => onToggleFavorite(track.id)}
                    onDelete={() => onDelete(track)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
