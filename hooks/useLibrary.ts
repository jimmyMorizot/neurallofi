'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Track } from '@/types';

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

  const fetchLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch tracks from Vercel Blob via API
      const response = await fetch('/api/library');
      if (!response.ok) {
        throw new Error('Failed to fetch library');
      }

      const data = await response.json();

      // Convert date strings to Date objects
      const tracksWithDates: Track[] = data.map((track: Track & { date: string }) => ({
        ...track,
        date: new Date(track.date),
      }));

      setTracks(tracksWithDates);
    } catch (err) {
      console.error('Error fetching library:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Set empty array on error
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTrack = useCallback(async (track: Track): Promise<boolean> => {
    try {
      // Delete from Vercel Blob via API
      const response = await fetch(
        `/api/library/${encodeURIComponent(track.filename)}?url=${encodeURIComponent(track.url)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete track');
      }

      // Remove from local state immediately for responsive UI
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
    setIsImporting(true);
    try {
      // Validate file type client-side
      if (!file.type.includes('audio/') && !file.name.endsWith('.mp3')) {
        toast.error('Invalid file type', {
          description: 'Only MP3 files are allowed.',
        });
        return false;
      }

      // Upload via FormData
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/library/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import track');
      }

      const result = await response.json();

      // Refresh library to show new track
      await fetchLibrary();

      toast.success('Track imported!', {
        description: result.track.title,
      });

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('tracks-updated'));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import track';
      toast.error('Import failed', {
        description: message,
      });
      return false;
    } finally {
      setIsImporting(false);
    }
  }, [fetchLibrary]);

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

  // Listen for custom event when new tracks are uploaded
  useEffect(() => {
    const handleTracksUpdated = () => {
      fetchLibrary();
    };

    window.addEventListener('tracks-updated', handleTracksUpdated);
    return () => window.removeEventListener('tracks-updated', handleTracksUpdated);
  }, [fetchLibrary]);

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
