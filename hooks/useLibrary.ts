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
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/library');

      if (!response.ok) {
        throw new Error('Failed to fetch library');
      }

      const data = await response.json();

      // Convert date strings to Date objects
      const tracksWithDates = data.map((track: Track & { date: string }) => ({
        ...track,
        date: new Date(track.date),
      }));

      setTracks(tracksWithDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTrack = useCallback(async (track: Track): Promise<boolean> => {
    try {
      const response = await fetch(`/api/library/${encodeURIComponent(track.filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete track');
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
    try {
      setIsImporting(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/library/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import file');
      }

      toast.success('Track imported', {
        description: file.name,
      });

      // Refresh library to show new track
      await fetchLibrary();
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
    // Export library metadata as JSON
    const exportData = tracks.map((track) => ({
      id: track.id,
      title: track.title,
      style: track.style,
      version: track.version,
      filename: track.filename,
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
