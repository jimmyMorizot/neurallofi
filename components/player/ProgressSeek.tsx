'use client';

import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressSeekProps {
  currentTime: number;
  duration: number;
  onSeek: (progress: number) => void;
  disabled?: boolean;
}

export function ProgressSeek({
  currentTime,
  duration,
  onSeek,
  disabled,
}: ProgressSeekProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !progressRef.current) return;

      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      onSeek(Math.max(0, Math.min(1, percentage)));
    },
    [disabled, onSeek]
  );

  return (
    <div className="w-full">
      <div
        ref={progressRef}
        onClick={handleClick}
        className={cn(
          'progress-bar cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
