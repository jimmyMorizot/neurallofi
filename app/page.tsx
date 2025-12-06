'use client';

import { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { GeneratorPanel } from '@/components/generator/GeneratorPanel';
import { Library } from '@/components/library/Library';
import { PlayerBar } from '@/components/player/PlayerBar';
import { useLibrary } from '@/hooks/useLibrary';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

export default function Home() {
  const { tracks, isLoading, refresh } = useLibrary();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaylist,
    next,
    previous,
  } = useAudioPlayer();

  // Update playlist when tracks change
  useEffect(() => {
    setPlaylist(tracks);
  }, [tracks, setPlaylist]);

  const handleGenerationComplete = () => {
    refresh();
  };

  return (
    <>
      {/* Scanlines overlay */}
      <div className="scanlines" />

      {/* 1. MOBILE HEADER (visible uniquement mobile) */}
      <header className="mobile-header lg:hidden">
        <div className="logo">NEURAL_LOFI</div>
        <Sheet>
          <SheetTrigger asChild>
            <button className="absolute right-4 p-2 text-white/70 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-[var(--bg-sidebar)] p-0 border-r border-white/10">
            <SheetTitle className="sr-only">Generator Panel</SheetTitle>
            <div className="p-6 h-full overflow-y-auto">
              <div className="logo mb-8">NEURAL_LOFI</div>
              <GeneratorPanel onGenerationComplete={handleGenerationComplete} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* 2. SIDEBAR (visible uniquement desktop via CSS) */}
      <aside className="sidebar">
        <div className="logo">NEURAL_LOFI</div>
        <GeneratorPanel onGenerationComplete={handleGenerationComplete} />
      </aside>

      {/* 3. MAIN CONTENT */}
      <main className="main-content">
        <h2 className="library-title">// LIBRARY_DATABASE</h2>
        <Library
          tracks={tracks}
          currentTrackId={currentTrack?.id || null}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={pause}
          isLoading={isLoading}
        />
      </main>

      {/* 4. PLAYER BAR (fixed bottom) */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPlayPause={togglePlay}
        onPrevious={previous}
        onNext={next}
        onSeek={seek}
        onVolumeChange={setVolume}
      />
    </>
  );
}
