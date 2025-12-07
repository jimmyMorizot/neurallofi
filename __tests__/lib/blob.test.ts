/**
 * Tests for lib/blob.ts
 * Testing Vercel Blob Storage operations with mocked @vercel/blob
 */

// Mock @vercel/blob before importing
jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  list: jest.fn(),
  del: jest.fn(),
}));

import { put, list, del } from '@vercel/blob';
import { uploadTrackToBlob, listTracksFromBlob, deleteTrackFromBlob } from '@/lib/blob';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('lib/blob.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadTrackToBlob', () => {
    it('should upload track with correct filename format', async () => {
      // Mock fetch to return audio blob
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      // Mock put to return uploaded URL
      (put as jest.Mock).mockResolvedValueOnce({
        url: 'https://blob.vercel.com/abc123_classic_v1.mp3',
      });

      const result = await uploadTrackToBlob('abc123', 'classic', 1, 'https://musicgpt.example.com/audio.mp3');

      expect(result.filename).toBe('abc123_classic_v1.mp3');
      expect(result.url).toBe('https://blob.vercel.com/abc123_classic_v1.mp3');
      expect(put).toHaveBeenCalledWith(
        'abc123_classic_v1.mp3',
        mockBlob,
        expect.objectContaining({
          access: 'public',
          contentType: 'audio/mpeg',
        })
      );
    });

    it('should handle version 2', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      (put as jest.Mock).mockResolvedValueOnce({
        url: 'https://blob.vercel.com/xyz789_indian_v2.mp3',
      });

      const result = await uploadTrackToBlob('xyz789', 'indian', 2, 'https://example.com/audio.mp3');

      expect(result.filename).toBe('xyz789_indian_v2.mp3');
      expect(put).toHaveBeenCalledWith(
        'xyz789_indian_v2.mp3',
        expect.any(Blob),
        expect.any(Object)
      );
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        uploadTrackToBlob('abc123', 'classic', 1, 'https://example.com/notfound.mp3')
      ).rejects.toThrow('Failed to fetch MP3: 404');
    });

    it('should throw error when blob upload fails', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mpeg' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      (put as jest.Mock).mockRejectedValueOnce(new Error('Blob storage error'));

      await expect(
        uploadTrackToBlob('abc123', 'classic', 1, 'https://example.com/audio.mp3')
      ).rejects.toThrow('Blob storage error');
    });
  });

  describe('listTracksFromBlob', () => {
    it('should parse tracks from blob list correctly', async () => {
      (list as jest.Mock).mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'abc123_classic_v1.mp3',
            url: 'https://blob.vercel.com/abc123_classic_v1.mp3',
            size: 5242880, // 5MB
            uploadedAt: '2024-01-15T10:30:00Z',
          },
          {
            pathname: 'abc123_classic_v2.mp3',
            url: 'https://blob.vercel.com/abc123_classic_v2.mp3',
            size: 5500000,
            uploadedAt: '2024-01-15T10:30:05Z',
          },
        ],
      });

      const tracks = await listTracksFromBlob();

      expect(tracks).toHaveLength(2);
      expect(tracks[0]).toMatchObject({
        id: 'abc123_v2',
        taskId: 'abc123',
        style: 'classic',
        version: 2,
        filename: 'abc123_classic_v2.mp3',
      });
      expect(tracks[1]).toMatchObject({
        id: 'abc123_v1',
        taskId: 'abc123',
        style: 'classic',
        version: 1,
      });
    });

    it('should skip files not matching naming convention', async () => {
      (list as jest.Mock).mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'abc123_classic_v1.mp3',
            url: 'https://blob.vercel.com/abc123_classic_v1.mp3',
            size: 5000000,
            uploadedAt: '2024-01-15T10:30:00Z',
          },
          {
            pathname: 'random-file.mp3',
            url: 'https://blob.vercel.com/random-file.mp3',
            size: 1000000,
            uploadedAt: '2024-01-14T10:30:00Z',
          },
          {
            pathname: 'document.pdf',
            url: 'https://blob.vercel.com/document.pdf',
            size: 500000,
            uploadedAt: '2024-01-13T10:30:00Z',
          },
        ],
      });

      const tracks = await listTracksFromBlob();

      expect(tracks).toHaveLength(1);
      expect(tracks[0].filename).toBe('abc123_classic_v1.mp3');
    });

    it('should format file sizes correctly', async () => {
      (list as jest.Mock).mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'test1_indian_v1.mp3',
            url: 'https://blob.vercel.com/test1_indian_v1.mp3',
            size: 1048576, // 1 MB
            uploadedAt: '2024-01-15T10:30:00Z',
          },
        ],
      });

      const tracks = await listTracksFromBlob();

      expect(tracks[0].size).toBe('1.0 MB');
    });

    it('should generate correct title from filename', async () => {
      (list as jest.Mock).mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'xyz123_african_v1.mp3',
            url: 'https://blob.vercel.com/xyz123_african_v1.mp3',
            size: 5000000,
            uploadedAt: '2024-01-15T10:30:00Z',
          },
        ],
      });

      const tracks = await listTracksFromBlob();

      expect(tracks[0].title).toBe('African Lo-Fi #xyz1');
    });

    it('should return empty array on error', async () => {
      (list as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const tracks = await listTracksFromBlob();

      expect(tracks).toEqual([]);
    });

    it('should sort tracks by date descending (newest first)', async () => {
      (list as jest.Mock).mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'old_classic_v1.mp3',
            url: 'https://blob.vercel.com/old_classic_v1.mp3',
            size: 5000000,
            uploadedAt: '2024-01-10T10:30:00Z',
          },
          {
            pathname: 'new_asian_v1.mp3',
            url: 'https://blob.vercel.com/new_asian_v1.mp3',
            size: 5000000,
            uploadedAt: '2024-01-20T10:30:00Z',
          },
        ],
      });

      const tracks = await listTracksFromBlob();

      expect(tracks[0].taskId).toBe('new');
      expect(tracks[1].taskId).toBe('old');
    });
  });

  describe('deleteTrackFromBlob', () => {
    it('should delete track and return true on success', async () => {
      (del as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await deleteTrackFromBlob('https://blob.vercel.com/abc123_classic_v1.mp3');

      expect(result).toBe(true);
      expect(del).toHaveBeenCalledWith('https://blob.vercel.com/abc123_classic_v1.mp3');
    });

    it('should return false on error', async () => {
      (del as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

      const result = await deleteTrackFromBlob('https://blob.vercel.com/abc123_classic_v1.mp3');

      expect(result).toBe(false);
    });
  });
});
