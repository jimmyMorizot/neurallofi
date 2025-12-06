'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Track } from '@/types';

const CROSSFADE_DURATION = 3; // seconds

interface UseAudioPlayerReturn {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: Track[];
  play: (track: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  setPlaylist: (tracks: Track[]) => void;
  next: () => void;
  previous: () => void;
  getFrequencyData: () => number[];
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  // Two audio elements for crossfade
  const primaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const secondaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioRef = useRef<'primary' | 'secondary'>('primary');
  const crossfadeInProgressRef = useRef(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio API for visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const primarySourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const secondarySourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [playlist, setPlaylist] = useState<Track[]>([]);

  // Get the currently active audio element
  const getActiveAudio = useCallback(() => {
    return activeAudioRef.current === 'primary'
      ? primaryAudioRef.current
      : secondaryAudioRef.current;
  }, []);

  const getInactiveAudio = useCallback(() => {
    return activeAudioRef.current === 'primary'
      ? secondaryAudioRef.current
      : primaryAudioRef.current;
  }, []);

  // Initialize Web Audio API and connect analyser
  const initAudioContext = useCallback((audioElement: HTMLAudioElement, isPrimary: boolean) => {
    if (typeof window === 'undefined') return;

    try {
      // Create AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        // Create shared analyser
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64; // Small for 5 bars
        analyserRef.current.smoothingTimeConstant = 0.8;
        analyserRef.current.connect(audioContextRef.current.destination);

        // Initialize data array
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      }

      // Resume context if suspended (autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create source for this audio element if not already created
      const sourceRef = isPrimary ? primarySourceRef : secondarySourceRef;
      if (!sourceRef.current && analyserRef.current) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  // Get frequency data for visualization (returns 5 values for 5 bars)
  const getFrequencyData = useCallback((): number[] => {
    if (!analyserRef.current || !dataArrayRef.current) {
      return [40, 60, 80, 50, 70]; // Default values
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    // Map frequency bins to 5 bars (focus on bass/low-mid frequencies)
    const data = dataArrayRef.current;
    const binCount = data.length;
    const barsCount = 5;
    const result: number[] = [];

    for (let i = 0; i < barsCount; i++) {
      // Focus on lower frequencies (bass)
      const binIndex = Math.floor((i / barsCount) * (binCount * 0.5));
      const value = data[binIndex] || 0;
      // Normalize to percentage (20-100 range for visual appeal)
      result.push(20 + (value / 255) * 80);
    }

    return result;
  }, []);

  // Initialize audio elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!primaryAudioRef.current) {
        primaryAudioRef.current = new Audio();
        primaryAudioRef.current.volume = volume;
        primaryAudioRef.current.crossOrigin = 'anonymous';
      }
      if (!secondaryAudioRef.current) {
        secondaryAudioRef.current = new Audio();
        secondaryAudioRef.current.volume = 0;
        secondaryAudioRef.current.crossOrigin = 'anonymous';
      }
    }

    return () => {
      if (primaryAudioRef.current) {
        primaryAudioRef.current.pause();
        primaryAudioRef.current = null;
      }
      if (secondaryAudioRef.current) {
        secondaryAudioRef.current.pause();
        secondaryAudioRef.current = null;
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Crossfade function
  const performCrossfade = useCallback((nextTrack: Track) => {
    const currentAudio = getActiveAudio();
    const nextAudio = getInactiveAudio();

    if (!currentAudio || !nextAudio || crossfadeInProgressRef.current) return;

    crossfadeInProgressRef.current = true;

    // Prepare next track
    nextAudio.src = nextTrack.url;
    nextAudio.volume = 0;
    nextAudio.load();
    nextAudio.play();

    const fadeSteps = 30; // Number of steps for smooth transition
    const stepDuration = (CROSSFADE_DURATION * 1000) / fadeSteps;
    let step = 0;

    fadeIntervalRef.current = setInterval(() => {
      step++;
      const progress = step / fadeSteps;

      // Fade out current, fade in next
      if (currentAudio) {
        currentAudio.volume = Math.max(0, volume * (1 - progress));
      }
      nextAudio.volume = volume * progress;

      if (step >= fadeSteps) {
        // Crossfade complete
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }

        // Stop and reset current audio
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio.volume = volume;
        }

        // Switch active audio
        activeAudioRef.current = activeAudioRef.current === 'primary' ? 'secondary' : 'primary';
        crossfadeInProgressRef.current = false;

        // Update state
        setCurrentTrack(nextTrack);
        setCurrentTime(0);
      }
    }, stepDuration);
  }, [volume, getActiveAudio, getInactiveAudio]);

  // Set up audio event listeners
  useEffect(() => {
    const setupListeners = (audio: HTMLAudioElement, isPrimary: boolean) => {
      const handleTimeUpdate = () => {
        // Only update from active audio
        if ((isPrimary && activeAudioRef.current === 'primary') ||
            (!isPrimary && activeAudioRef.current === 'secondary')) {
          setCurrentTime(audio.currentTime);

          // Check if we should start crossfade (3 seconds before end)
          if (audio.duration && !crossfadeInProgressRef.current) {
            const timeRemaining = audio.duration - audio.currentTime;
            if (timeRemaining <= CROSSFADE_DURATION && timeRemaining > 0) {
              const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
              if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
                performCrossfade(playlist[currentIndex + 1]);
              }
            }
          }
        }
      };

      const handleDurationChange = () => {
        if ((isPrimary && activeAudioRef.current === 'primary') ||
            (!isPrimary && activeAudioRef.current === 'secondary')) {
          setDuration(audio.duration || 0);
        }
      };

      const handleEnded = () => {
        if (!crossfadeInProgressRef.current) {
          // No crossfade happened, just end
          const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
          if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
            const nextTrack = playlist[currentIndex + 1];
            play(nextTrack);
          } else {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }
      };

      const handlePlay = () => {
        if ((isPrimary && activeAudioRef.current === 'primary') ||
            (!isPrimary && activeAudioRef.current === 'secondary')) {
          setIsPlaying(true);
        }
      };

      const handlePause = () => {
        if ((isPrimary && activeAudioRef.current === 'primary') ||
            (!isPrimary && activeAudioRef.current === 'secondary')) {
          if (!crossfadeInProgressRef.current) {
            setIsPlaying(false);
          }
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    };

    const cleanupPrimary = primaryAudioRef.current
      ? setupListeners(primaryAudioRef.current, true)
      : undefined;
    const cleanupSecondary = secondaryAudioRef.current
      ? setupListeners(secondaryAudioRef.current, false)
      : undefined;

    return () => {
      cleanupPrimary?.();
      cleanupSecondary?.();
    };
  }, [currentTrack, playlist, performCrossfade]);

  const play = useCallback((track: Track) => {
    const audio = getActiveAudio();
    if (!audio) return;

    // If same track, just resume
    if (currentTrack?.id === track.id) {
      audio.play();
      return;
    }

    // Cancel any ongoing crossfade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
      crossfadeInProgressRef.current = false;
    }

    // Stop inactive audio
    const inactiveAudio = getInactiveAudio();
    if (inactiveAudio) {
      inactiveAudio.pause();
      inactiveAudio.currentTime = 0;
    }

    // Load new track
    audio.src = track.url;
    audio.volume = volume;
    audio.load();
    audio.play();
    setCurrentTrack(track);
    setCurrentTime(0);

    // Initialize audio context for visualization
    const isPrimary = activeAudioRef.current === 'primary';
    initAudioContext(audio, isPrimary);
  }, [currentTrack, volume, getActiveAudio, getInactiveAudio, initAudioContext]);

  const pause = useCallback(() => {
    getActiveAudio()?.pause();
  }, [getActiveAudio]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      getActiveAudio()?.play();
    }
  }, [isPlaying, currentTrack, pause, getActiveAudio]);

  const seek = useCallback((progress: number) => {
    const audio = getActiveAudio();
    if (!audio || !duration) return;

    const newTime = progress * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration, getActiveAudio]);

  const setVolume = useCallback((newVolume: number) => {
    const audio = getActiveAudio();
    if (audio) {
      audio.volume = newVolume;
    }
    setVolumeState(newVolume);
  }, [getActiveAudio]);

  const next = useCallback(() => {
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      play(playlist[currentIndex + 1]);
    }
  }, [currentTrack, playlist, play]);

  const previous = useCallback(() => {
    const audio = getActiveAudio();

    // If more than 3 seconds into the track, restart it
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      play(playlist[currentIndex - 1]);
    }
  }, [currentTrack, playlist, play, getActiveAudio]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaylist,
    next,
    previous,
    getFrequencyData,
  };
}
