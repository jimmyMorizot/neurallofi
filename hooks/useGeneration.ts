'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type {
  GenerationRequest,
  GenerationStatus,
  ConsoleMessage,
  ConsoleMessageType,
  MusicStyle,
} from '@/types';
import { generateId } from '@/lib/utils';

// Mock sample URLs (for local dev without API key)
const MOCK_SAMPLE_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
];

interface UseGenerationOptions {
  onComplete?: () => void;
  pollingInterval?: number;
}

interface UseGenerationReturn {
  generate: (request: GenerationRequest) => Promise<void>;
  status: GenerationStatus;
  progress: number;
  eta: number;
  messages: ConsoleMessage[];
  error: string | null;
  reset: () => void;
}

export function useGeneration(options: UseGenerationOptions = {}): UseGenerationReturn {
  const { onComplete, pollingInterval = 3000 } = options;

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);
  const [messages, setMessages] = useState<ConsoleMessage[]>([
    {
      id: generateId(),
      text: 'System ready',
      type: 'success',
      timestamp: new Date(),
    },
    {
      id: generateId(),
      text: 'Audio context initialized',
      type: 'info',
      timestamp: new Date(),
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const initialEtaRef = useRef<number>(0);

  const addMessage = useCallback((text: string, type: ConsoleMessageType) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        text,
        type,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Upload tracks to Vercel Blob Storage
  const uploadTracksToBlob = useCallback(
    async (taskId: string, style: MusicStyle, files: { url: string; version: number }[]) => {
      try {
        addMessage('Uploading to cloud storage...', 'process');

        const response = await fetch('/api/library/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId, style, files }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload tracks');
        }

        const result = await response.json();
        console.log('[Generation] Uploaded tracks:', result.tracks);

        // Dispatch event to refresh library
        window.dispatchEvent(new Event('tracks-updated'));

        addMessage(`${result.tracks.length} track(s) saved to library`, 'success');
      } catch (err) {
        console.error('[Generation] Upload error:', err);
        addMessage('Failed to save tracks to cloud', 'error');
        throw err;
      }
    },
    [addMessage]
  );

  const pollStatus = useCallback(
    async (taskId: string, conversionId: string, style: MusicStyle) => {
      try {
        const response = await fetch(`/api/status/${taskId}?conversionId=${conversionId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          stopPolling();
          setProgress(95);
          addMessage('SEQUENCE COMPLETE', 'success');

          if (data.files && data.files.length > 0) {
            // Upload tracks to Vercel Blob
            await uploadTracksToBlob(taskId, style, data.files);
          }

          setStatus('completed');
          setProgress(100);
          setEta(0);

          toast.success('Track generated!', {
            description: 'Your Lo-Fi track is ready to play.',
          });

          if (onComplete) {
            onComplete();
          }
        } else if (data.status === 'failed') {
          stopPolling();
          setStatus('failed');
          const errorMsg = data.error || 'Generation failed';
          setError(errorMsg);
          addMessage(errorMsg, 'error');
          toast.error('Generation failed', {
            description: errorMsg,
          });
        } else {
          // Update progress based on time elapsed
          const elapsed = Date.now() - startTimeRef.current;
          const estimatedProgress = Math.min(
            90,
            (elapsed / (initialEtaRef.current * 1000)) * 100
          );
          setProgress(estimatedProgress);

          // Update ETA
          const remainingTime = Math.max(
            0,
            initialEtaRef.current - elapsed / 1000
          );
          setEta(Math.ceil(remainingTime));

          // Update progress message
          if (data.progress) {
            addMessage(data.progress, 'process');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    },
    [addMessage, onComplete, stopPolling, uploadTracksToBlob]
  );

  const runMockGeneration = useCallback(
    async (taskId: string, style: MusicStyle) => {
      const steps = [
        { delay: 1000, progress: 'Connecting to MusicGPT...' },
        { delay: 1500, progress: 'Analyzing style parameters...' },
        { delay: 2000, progress: 'Generating waveform...' },
        { delay: 2000, progress: 'Applying textures...' },
        { delay: 1500, progress: 'Mastering audio tracks...' },
        { delay: 1000, progress: 'Finalizing...' },
      ];

      let currentProgress = 0;
      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, step.delay));
        currentProgress += 15;
        setProgress(Math.min(currentProgress, 90));
        addMessage(step.progress, 'process');
      }

      addMessage('SEQUENCE COMPLETE', 'success');

      // Mock files: 2 versions per spec
      const mockFiles = [
        { url: MOCK_SAMPLE_URLS[0], version: 1 },
        { url: MOCK_SAMPLE_URLS[1], version: 2 },
      ];

      // Upload mock tracks to Vercel Blob
      await uploadTracksToBlob(taskId, style, mockFiles);

      setStatus('completed');
      setProgress(100);
      setEta(0);

      toast.success('Track generated!', {
        description: 'Your Lo-Fi track is ready to play.',
      });

      if (onComplete) {
        onComplete();
      }
    },
    [addMessage, uploadTracksToBlob, onComplete]
  );

  const generate = useCallback(
    async (request: GenerationRequest) => {
      try {
        // Reset state
        setStatus('pending');
        setProgress(0);
        setError(null);
        setMessages([]);

        addMessage('Connecting to MusicGPT...', 'process');

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to start generation');
        }

        const data = await response.json();

        setStatus('processing');
        setEta(data.eta);
        startTimeRef.current = Date.now();
        initialEtaRef.current = data.eta;

        addMessage('Generation started', 'success');
        addMessage(`Estimated time: ${data.eta}s`, 'info');

        // Check if mock mode (no API key configured)
        if (data.mockMode) {
          // Run mock generation client-side
          await runMockGeneration(data.taskId, data.style || request.style);
        } else if (data.conversionId) {
          // Real mode: poll with conversionId
          pollingRef.current = setInterval(() => {
            pollStatus(data.taskId, data.conversionId, data.style || request.style);
          }, pollingInterval);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        setStatus('failed');
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        addMessage(errorMessage, 'error');
        toast.error('Failed to start generation', {
          description: errorMessage,
        });
      }
    },
    [addMessage, pollStatus, pollingInterval, runMockGeneration]
  );

  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setProgress(0);
    setEta(0);
    setError(null);
    setMessages([
      {
        id: generateId(),
        text: 'System ready',
        type: 'success',
        timestamp: new Date(),
      },
    ]);
  }, [stopPolling]);

  return {
    generate,
    status,
    progress,
    eta,
    messages,
    error,
    reset,
  };
}
