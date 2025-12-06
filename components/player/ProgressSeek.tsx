'use client';

import { useCallback, useRef } from 'react';
import { formatDuration } from '@/lib/utils';
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
    <div className="w-full flex items-center gap-3 text-xs text-muted-foreground">
      <span className="w-10 text-right tabular-nums">
        {formatDuration(currentTime)}
      </span>

      <div
        ref={progressRef}
        onClick={handleClick}
        className={cn(
          'flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full progress-gradient shadow-[0_0_10px_rgba(0,240,255,0.4)]"
          style={{ width: `${progress}%` }}
        />

        {/* Seek knob */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full',
            'shadow-[0_0_10px_white] opacity-0 group-hover:opacity-100 transition-opacity',
            disabled && 'hidden'
          )}
          style={{ left: `calc(${progress}% - 5px)` }}
        />
      </div>

      <span className="w-10 tabular-nums">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
