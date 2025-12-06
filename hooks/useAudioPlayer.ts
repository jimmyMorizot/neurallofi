'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Track } from '@/types';

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
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [playlist, setPlaylist] = useState<Track[]>([]);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      // Auto-play next track
      const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        const nextTrack = playlist[currentIndex + 1];
        play(nextTrack);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

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
  }, [currentTrack, playlist]);

  const play = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If same track, just resume
    if (currentTrack?.id === track.id) {
      audio.play();
      return;
    }

    // Load new track
    audio.src = track.url;
    audio.load();
    audio.play();
    setCurrentTrack(track);
    setCurrentTime(0);
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      audioRef.current?.play();
    }
  }, [isPlaying, currentTrack, pause]);

  const seek = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = progress * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const setVolume = useCallback((newVolume: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
    setVolumeState(newVolume);
  }, []);

  const next = useCallback(() => {
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      play(playlist[currentIndex + 1]);
    }
  }, [currentTrack, playlist, play]);

  const previous = useCallback(() => {
    const audio = audioRef.current;

    // If more than 3 seconds into the track, restart it
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      play(playlist[currentIndex - 1]);
    }
  }, [currentTrack, playlist, play]);

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
  };
}
