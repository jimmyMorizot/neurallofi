'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Track, MusicStyle } from '@/types';

const STORAGE_KEY = 'neural-lofi-tracks';

interface StoredTrack {
  id: string;
  title: string;
  style: MusicStyle;
  url: string;
  createdAt: string;
}

interface UseLibraryReturn {
  tracks: Track[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteTrack: (track: Track) => Promise<boolean>;
  importTrack: (file: File) => Promise<boolean>;
  exportLibrary: () => void;
}

export function useLibrary(): UseLibraryReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedTracks: StoredTrack[] = JSON.parse(stored);
        // Convert to Track format
        const converted: Track[] = storedTracks.map((t) => ({
          id: t.id,
          title: t.title,
          style: t.style,
          version: 1,
          filename: t.id + '.mp3',
          url: t.url,
          date: new Date(t.createdAt),
          size: 0,
        }));
        setTracks(converted);
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  }, []);

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Load from localStorage (works on Vercel)
    loadFromLocalStorage();

    setIsLoading(false);
  }, [loadFromLocalStorage]);

  const deleteTrack = useCallback(async (track: Track): Promise<boolean> => {
    try {
      // Remove from localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedTracks: StoredTrack[] = JSON.parse(stored);
        const filtered = storedTracks.filter((t) => t.id !== track.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }

      // Remove from local state
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      toast.success('Track deleted', {
        description: track.title,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete track';
      toast.error('Delete failed', {
        description: message,
      });
      return false;
    }
  }, []);

  const importTrack = useCallback(async (file: File): Promise<boolean> => {
    // Import is disabled on Vercel
    toast.error('Import disabled', {
      description: 'Use the AI generator to create tracks!',
    });
    return false;
  }, []);

  const exportLibrary = useCallback(() => {
    const exportData = tracks.map((track) => ({
      id: track.id,
      title: track.title,
      style: track.style,
      version: track.version,
      url: track.url,
      date: track.date.toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-lofi-library-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Library exported', {
      description: `${tracks.length} tracks exported`,
    });
  }, [tracks]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // Listen for storage changes (when new tracks are added)
  useEffect(() => {
    const handleStorage = () => {
      loadFromLocalStorage();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadFromLocalStorage]);

  return {
    tracks,
    isLoading,
    isImporting,
    error,
    refresh: fetchLibrary,
    deleteTrack,
    importTrack,
    exportLibrary,
  };
}
