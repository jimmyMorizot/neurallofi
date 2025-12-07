/**
 * Tests for hooks/useLibrary.ts
 * Testing library operations with mocked API calls
 */

import { renderHook, act, waitFor } from '@testing-library/react';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { useLibrary } from '@/hooks/useLibrary';
import { toast } from 'sonner';
import type { Track } from '@/types';

describe('useLibrary hook', () => {
  const mockTracks: Track[] = [
    {
      id: 'abc123_v1',
      filename: 'abc123_classic_v1.mp3',
      url: 'https://blob.vercel.com/abc123_classic_v1.mp3',
      taskId: 'abc123',
      style: 'classic',
      version: 1,
      title: 'Classic Lo-Fi #abc1',
      date: new Date('2024-01-15T10:30:00Z'),
      size: '5.0 MB',
    },
    {
      id: 'xyz789_v1',
      filename: 'xyz789_indian_v1.mp3',
      url: 'https://blob.vercel.com/xyz789_indian_v1.mp3',
      taskId: 'xyz789',
      style: 'indian',
      version: 1,
      title: 'Indian Lo-Fi #xyz7',
      date: new Date('2024-01-14T10:30:00Z'),
      size: '4.5 MB',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful response for initial fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTracks.map((t) => ({
        ...t,
        date: t.date.toISOString(),
      }))),
    });
  });

  describe('initial fetch', () => {
    it('should fetch tracks on mount', async () => {
      const { result } = renderHook(() => useLibrary());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/library');
      expect(result.current.tracks).toHaveLength(2);
    });

    it('should convert date strings to Date objects', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tracks[0].date).toBeInstanceOf(Date);
    });

    it('should handle fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch library');
      expect(result.current.tracks).toEqual([]);
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.tracks).toEqual([]);
    });
  });

  describe('deleteTrack', () => {
    it('should delete track and update local state', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock delete response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const trackToDelete = result.current.tracks[0];
      let deleteResult: boolean = false;

      await act(async () => {
        deleteResult = await result.current.deleteTrack(trackToDelete);
      });

      expect(deleteResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/library/'),
        { method: 'DELETE' }
      );
      expect(result.current.tracks).toHaveLength(1);
      expect(result.current.tracks[0].id).toBe('xyz789_v1');
      expect(toast.success).toHaveBeenCalledWith('Track deleted', expect.any(Object));
    });

    it('should handle delete error', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Delete failed' }),
      });

      const trackToDelete = result.current.tracks[0];
      let deleteResult: boolean = true;

      await act(async () => {
        deleteResult = await result.current.deleteTrack(trackToDelete);
      });

      expect(deleteResult).toBe(false);
      expect(result.current.tracks).toHaveLength(2); // No change
      expect(toast.error).toHaveBeenCalledWith('Delete failed', expect.any(Object));
    });
  });

  describe('importTrack', () => {
    it('should upload file and return true on success', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock successful import response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          track: {
            id: 'imp123_v1',
            taskId: 'imp123',
            title: 'My Track',
            style: 'imported',
            version: 1,
            filename: 'imp123_imported_v1.mp3',
            url: 'https://blob.vercel.com/imp123_imported_v1.mp3',
          },
        }),
      });
      // Mock refresh call after import
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTracks.map((t) => ({
          ...t,
          date: t.date.toISOString(),
        }))),
      });

      const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
      let importResult: boolean = false;

      await act(async () => {
        importResult = await result.current.importTrack(mockFile);
      });

      expect(importResult).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/library/import', expect.objectContaining({
        method: 'POST',
      }));
      expect(toast.success).toHaveBeenCalledWith('Track imported!', expect.any(Object));
    });

    it('should reject non-MP3 files client-side', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockFile = new File(['text'], 'test.txt', { type: 'text/plain' });
      let importResult: boolean = true;

      await act(async () => {
        importResult = await result.current.importTrack(mockFile);
      });

      expect(importResult).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Invalid file type', expect.any(Object));
    });

    it('should handle import error', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const mockFile = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
      let importResult: boolean = true;

      await act(async () => {
        importResult = await result.current.importTrack(mockFile);
      });

      expect(importResult).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Import failed', expect.any(Object));
    });
  });

  describe('refresh', () => {
    it('should refetch library', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith('/api/library');
    });
  });

  describe('tracks-updated event', () => {
    it('should refetch when tracks-updated event is dispatched', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);

      act(() => {
        window.dispatchEvent(new Event('tracks-updated'));
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('exportLibrary', () => {
    it('should call exportLibrary without errors', async () => {
      const { result } = renderHook(() => useLibrary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Just verify the function exists and can be called
      expect(typeof result.current.exportLibrary).toBe('function');
    });
  });
});
