'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type {
  GenerationRequest,
  GenerationStatus,
  ConsoleMessage,
  ConsoleMessageType,
} from '@/types';
import { generateId } from '@/lib/utils';

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
  const { onComplete, pollingInterval = 2000 } = options;

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

  const pollStatus = useCallback(
    async (taskId: string) => {
      try {
        const response = await fetch(`/api/status/${taskId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          stopPolling();
          setStatus('completed');
          setProgress(100);
          setEta(0);
          addMessage('SEQUENCE COMPLETE', 'success');
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
    [addMessage, onComplete, stopPolling]
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

        // Start polling
        pollingRef.current = setInterval(() => {
          pollStatus(data.taskId);
        }, pollingInterval);
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
    [addMessage, pollStatus, pollingInterval]
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
