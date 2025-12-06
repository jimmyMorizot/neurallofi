'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Track } from '@/types';

interface UseLibraryReturn {
  tracks: Track[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLibrary(): UseLibraryReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  return {
    tracks,
    isLoading,
    error,
    refresh: fetchLibrary,
  };
}
