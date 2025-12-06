'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VisualizerProps {
  isPlaying: boolean;
}

// Hauteurs fixes pour éviter l'erreur d'hydratation
const INITIAL_HEIGHTS = [40, 60, 80, 50, 70];
const ANIMATION_INTERVAL = 200; // ms - optimisé pour mobile

export function Visualizer({ isPlaying }: VisualizerProps) {
  const [heights, setHeights] = useState(INITIAL_HEIGHTS);
  const lastUpdateRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Animation avec requestAnimationFrame throttlé pour meilleures performances
  useEffect(() => {
    if (!isPlaying) {
      setHeights(INITIAL_HEIGHTS);
      return;
    }

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= ANIMATION_INTERVAL) {
        setHeights(INITIAL_HEIGHTS.map(() => 20 + Math.random() * 80));
        lastUpdateRef.current = timestamp;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className={cn('visualizer', !isPlaying && 'paused')}>
      {heights.map((height, i) => (
        <div
          key={i}
          className="visualizer-bar"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
