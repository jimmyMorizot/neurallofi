'use client';

import { useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen pb-[var(--player-height)]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.08] glass">
        <h1 className="text-lg font-bold bg-gradient-to-r from-white to-[var(--neon-cyan)] bg-clip-text text-transparent">
          NEURAL_LOFI
        </h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] bg-[var(--neural-bg)] p-0">
            <SheetTitle className="sr-only">Generator Panel</SheetTitle>
            <div className="p-4">
              <GeneratorPanel onGenerationComplete={handleGenerationComplete} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[var(--sidebar-width)_1fr] md:h-screen md:overflow-hidden">
        {/* Sidebar - Generator */}
        <aside className="h-full overflow-y-auto border-r border-white/[0.08] bg-black/50 p-6">
          {/* Logo */}
          <div className="mb-8 pb-4 border-b border-white/[0.08]">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-[var(--neon-cyan)] bg-clip-text text-transparent">
              NEURAL_LOFI
            </h1>
          </div>

          <GeneratorPanel onGenerationComplete={handleGenerationComplete} />
        </aside>

        {/* Main - Library */}
        <main className="h-full overflow-y-auto p-6 pb-[calc(var(--player-height)+1.5rem)]">
          <Library
            tracks={tracks}
            currentTrackId={currentTrack?.id || null}
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Mobile Layout */}
      <main className="md:hidden p-4">
        <Library
          tracks={tracks}
          currentTrackId={currentTrack?.id || null}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={pause}
          isLoading={isLoading}
        />
      </main>

      {/* Player Bar */}
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
    </div>
  );
}
