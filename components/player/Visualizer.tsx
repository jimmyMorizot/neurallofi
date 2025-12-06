'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VisualizerProps {
  isPlaying: boolean;
  getFrequencyData?: () => number[];
}

// Hauteurs fixes pour éviter l'erreur d'hydratation
const INITIAL_HEIGHTS = [40, 60, 80, 50, 70];
const ANIMATION_INTERVAL = 50; // ms - plus réactif avec Web Audio API

export function Visualizer({ isPlaying, getFrequencyData }: VisualizerProps) {
  const [heights, setHeights] = useState(INITIAL_HEIGHTS);
  const rafRef = useRef<number>(0);

  // Animation avec requestAnimationFrame et Web Audio API
  useEffect(() => {
    if (!isPlaying) {
      setHeights(INITIAL_HEIGHTS);
      return;
    }

    const animate = () => {
      if (getFrequencyData) {
        // Utiliser les vraies données de fréquence
        const frequencyData = getFrequencyData();
        setHeights(frequencyData);
      } else {
        // Fallback avec animation aléatoire
        setHeights(INITIAL_HEIGHTS.map(() => 20 + Math.random() * 80));
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, getFrequencyData]);

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
