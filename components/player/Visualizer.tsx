'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VisualizerProps {
  isPlaying: boolean;
  getFrequencyData?: () => number[];
}

// Hauteurs fixes pour éviter l'erreur d'hydratation
const INITIAL_HEIGHTS = [40, 60, 80, 50, 70];
const TARGET_FPS = 30; // Throttle à 30fps pour économiser CPU
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export function Visualizer({ isPlaying, getFrequencyData }: VisualizerProps) {
  const [heights, setHeights] = useState(INITIAL_HEIGHTS);
  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Animation avec requestAnimationFrame throttlé à 30fps
  useEffect(() => {
    if (!isPlaying) {
      setHeights(INITIAL_HEIGHTS);
      return;
    }

    const animate = (timestamp: number) => {
      // Throttle: ne mettre à jour que si assez de temps s'est écoulé
      if (timestamp - lastFrameTimeRef.current >= FRAME_INTERVAL) {
        lastFrameTimeRef.current = timestamp;

        if (getFrequencyData) {
          // Utiliser les vraies données de fréquence
          const frequencyData = getFrequencyData();
          setHeights(frequencyData);
        } else {
          // Fallback avec animation aléatoire
          setHeights(INITIAL_HEIGHTS.map(() => 20 + Math.random() * 80));
        }
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
