'use client';

import { useEffect, useState } from 'react';
import { Library as LibraryIcon, Sparkles } from 'lucide-react';
import { GeneratorPanel } from '@/components/generator/GeneratorPanel';
import { Library } from '@/components/library/Library';
import { PlayerBar } from '@/components/player/PlayerBar';
import { FavoritesSection } from '@/components/sidebar/FavoritesSection';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { useLibrary } from '@/hooks/useLibrary';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useFavorites } from '@/hooks/useFavorites';

type MobileView = 'library' | 'create';

export default function Home() {
  const [mobileView, setMobileView] = useState<MobileView>('library');
  const [showFavoritesFilter, setShowFavoritesFilter] = useState(false);
  const { tracks, isLoading, isImporting, refresh, deleteTrack, importTrack, exportLibrary } = useLibrary();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
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
    getFrequencyData,
  } = useAudioPlayer();

  // Update playlist when tracks change
  useEffect(() => {
    setPlaylist(tracks);
  }, [tracks, setPlaylist]);

  const handleGenerationComplete = () => {
    refresh();
    // Switch to library view after generation
    setMobileView('library');
  };

  return (
    <>
      {/* Scanlines overlay */}
      <div className="scanlines" />

      {/* MOBILE HEADER - Logo only, no hamburger menu */}
      <header className="mobile-header lg:hidden">
        <div className="logo">Neural Lofi</div>
      </header>

      {/* 2. SIDEBAR (visible uniquement desktop via CSS) */}
      <aside className="sidebar">
        <div className="logo">Neural Lofi</div>
        <FavoritesSection
          count={favorites.size}
          isActive={showFavoritesFilter}
          onToggle={() => setShowFavoritesFilter(!showFavoritesFilter)}
        />
        <GeneratorPanel onGenerationComplete={handleGenerationComplete} />
      </aside>

      {/* 3. MAIN CONTENT - Desktop always shows library */}
      <main className="main-content hidden lg:block">
        <h2 className="library-title">Library</h2>
        <Library
          tracks={tracks}
          currentTrackId={currentTrack?.id || null}
          isPlaying={isPlaying}
          onPlay={play}
          onPause={pause}
          onDelete={deleteTrack}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onImport={importTrack}
          isLoading={isLoading}
          isImporting={isImporting}
          showFavoritesOnly={showFavoritesFilter}
        />
      </main>

      {/* MOBILE CONTENT - Switches between Library and Create */}
      <main className="mobile-content lg:hidden">
        {mobileView === 'library' ? (
          <>
            <h2 className="library-title">Library</h2>
            <Library
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onPlay={play}
              onPause={pause}
              onDelete={deleteTrack}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onImport={importTrack}
              isLoading={isLoading}
              isImporting={isImporting}
              showFavoritesOnly={showFavoritesFilter}
            />
          </>
        ) : (
          <div className="mobile-generator">
            <h2 className="library-title">Create</h2>
            <GeneratorPanel onGenerationComplete={handleGenerationComplete} />
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION - Spotify/Deezer style */}
      <nav className="mobile-nav lg:hidden">
        <button
          className={`mobile-nav-item ${mobileView === 'library' ? 'active' : ''}`}
          onClick={() => setMobileView('library')}
        >
          <LibraryIcon className="h-5 w-5" />
          <span>Library</span>
        </button>
        <button
          className={`mobile-nav-item ${mobileView === 'create' ? 'active' : ''}`}
          onClick={() => setMobileView('create')}
        >
          <Sparkles className="h-5 w-5" />
          <span>Create</span>
        </button>
      </nav>

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
        getFrequencyData={getFrequencyData}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </>
  );
}
