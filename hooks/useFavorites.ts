'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'neural-lofi-favorites';

interface UseFavoritesReturn {
  favorites: Set<string>;
  isFavorite: (trackId: string) => boolean;
  toggleFavorite: (trackId: string) => void;
  addFavorite: (trackId: string) => void;
  removeFavorite: (trackId: string) => void;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const isInitialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
        }
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
    // Mark as initialized after loading
    isInitialized.current = true;
  }, []);

  // Save to localStorage when favorites change (skip first render)
  useEffect(() => {
    // Don't save on first render to avoid race condition
    if (!isInitialized.current) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (trackId: string) => favorites.has(trackId),
    [favorites]
  );

  const addFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => new Set([...prev, trackId]));
  }, []);

  const removeFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(trackId);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
