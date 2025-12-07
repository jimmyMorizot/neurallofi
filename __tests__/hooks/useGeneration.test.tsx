/**
 * Tests for hooks/useGeneration.ts
 * Testing generation flow with mocked API calls (no real MusicGPT calls!)
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

// Mock generateId
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  generateId: jest.fn(() => 'test-id-123'),
}));

import { useGeneration } from '@/hooks/useGeneration';
import { toast } from 'sonner';

describe('useGeneration hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useGeneration());

      expect(result.current.status).toBe('idle');
      expect(result.current.progress).toBe(0);
      expect(result.current.eta).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.messages).toHaveLength(2); // Initial messages
    });

    it('should have initial system messages', () => {
      const { result } = renderHook(() => useGeneration());

      expect(result.current.messages[0].text).toBe('System ready');
      expect(result.current.messages[0].type).toBe('success');
      expect(result.current.messages[1].text).toBe('Audio context initialized');
      expect(result.current.messages[1].type).toBe('info');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', async () => {
      const { result } = renderHook(() => useGeneration());

      // Simulate some state changes
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          taskId: 'task123',
          eta: 30,
          mockMode: true,
          style: 'classic',
        }),
      });

      await act(async () => {
        result.current.generate({ style: 'classic', textures: [] });
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.progress).toBe(0);
      expect(result.current.eta).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('generate - mock mode', () => {
    it('should start generation and update status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          taskId: 'task123',
          eta: 30,
          mockMode: true,
          style: 'classic',
        }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        result.current.generate({ style: 'classic', textures: ['rain'] });
      });

      expect(result.current.status).toBe('processing');
      expect(mockFetch).toHaveBeenCalledWith('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: 'classic', textures: ['rain'] }),
      });
    });

    it('should add connecting message on generate start', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          taskId: 'task123',
          eta: 30,
          mockMode: true,
          style: 'classic',
        }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        result.current.generate({ style: 'classic', textures: [] });
      });

      const messages = result.current.messages;
      expect(messages.some((m) => m.text === 'Connecting to MusicGPT...')).toBe(true);
    });

    it('should handle API error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'API rate limit exceeded' }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        result.current.generate({ style: 'classic', textures: [] });
      });

      expect(result.current.status).toBe('failed');
      expect(result.current.error).toBe('API rate limit exceeded');
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to start generation',
        expect.objectContaining({ description: 'API rate limit exceeded' })
      );
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        result.current.generate({ style: 'classic', textures: [] });
      });

      expect(result.current.status).toBe('failed');
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('generate - real mode with polling', () => {
    it('should start polling when conversionId is returned', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          taskId: 'task123',
          conversionId: 'conv456',
          eta: 60,
          style: 'indian',
        }),
      });

      const { result } = renderHook(() => useGeneration({ pollingInterval: 1000 }));

      await act(async () => {
        result.current.generate({ style: 'indian', textures: ['vinyl'] });
      });

      expect(result.current.status).toBe('processing');
      expect(result.current.eta).toBe(60);
    });

    it('should complete when status returns completed', async () => {
      // Initial generate response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          taskId: 'task123',
          conversionId: 'conv456',
          eta: 10,
          style: 'classic',
        }),
      });

      // Mock upload endpoint for completion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'completed',
          files: [
            { url: 'https://musicgpt.com/audio1.mp3', version: 1 },
            { url: 'https://musicgpt.com/audio2.mp3', version: 2 },
          ],
        }),
      });

      // Mock upload to blob
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          tracks: [{ id: 'track1' }, { id: 'track2' }],
        }),
      });

      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useGeneration({ onComplete, pollingInterval: 100 })
      );

      await act(async () => {
        result.current.generate({ style: 'classic', textures: [] });
      });

      // Fast-forward through polling
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('completed');
      });
    });

    it('should handle failed status from polling', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          taskId: 'task123',
          conversionId: 'conv456',
          eta: 10,
          style: 'classic',
        }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'failed',
          error: 'Generation timeout',
        }),
      });

      const { result } = renderHook(() =>
        useGeneration({ pollingInterval: 100 })
      );

      await act(async () => {
        result.current.generate({ style: 'classic', textures: [] });
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('failed');
        expect(result.current.error).toBe('Generation timeout');
      });
    });
  });

  describe('messages', () => {
    it('should accumulate messages during generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          taskId: 'task123',
          eta: 30,
          mockMode: true,
          style: 'classic',
        }),
      });

      // Mock for blob upload
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          tracks: [],
        }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        result.current.generate({ style: 'classic', textures: [] });
      });

      // Messages should include generation started
      expect(result.current.messages.some((m) => m.text === 'Generation started')).toBe(true);
      expect(result.current.messages.some((m) => m.text.includes('Estimated time'))).toBe(true);
    });
  });
});
