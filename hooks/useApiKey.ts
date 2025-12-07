'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'neurallofi_user_api_key';

interface UseApiKeyReturn {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  hasApiKey: boolean;
}

export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setApiKeyState(stored);
      }
    } catch (err) {
      console.error('Error reading API key from localStorage:', err);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    try {
      const trimmedKey = key.trim();
      if (trimmedKey) {
        localStorage.setItem(STORAGE_KEY, trimmedKey);
        setApiKeyState(trimmedKey);
      }
    } catch (err) {
      console.error('Error saving API key to localStorage:', err);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setApiKeyState(null);
    } catch (err) {
      console.error('Error clearing API key from localStorage:', err);
    }
  }, []);

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    hasApiKey: !!apiKey,
  };
}
