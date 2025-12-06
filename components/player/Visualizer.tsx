'use client';

import { cn } from '@/lib/utils';

interface VisualizerProps {
  isPlaying: boolean;
}

export function Visualizer({ isPlaying }: VisualizerProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-[3px] h-[30px]',
        !isPlaying && 'visualizer-paused'
      )}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="visualizer-bar rounded-sm"
          style={{
            height: `${20 + Math.random() * 80}%`,
          }}
        />
      ))}
    </div>
  );
}
