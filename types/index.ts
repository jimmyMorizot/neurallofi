// ============================================
// Neural_Lofi - Type Definitions
// ============================================

// Music Generation Types
export type MusicStyle = 'classic' | 'indian' | 'african' | 'asian' | 'latino' | 'imported';

export type TextureType = 'rain' | 'vinyl' | 'city' | 'typing';

export type GenerationStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

// API Request/Response Types
export interface GenerationRequest {
  style: MusicStyle;
  textures: TextureType[];
  withVocals?: boolean;
  customLyrics?: string; // Custom lyrics for vocal generation
}

export interface GenerationResponse {
  taskId: string;
  eta: number; // seconds
}

export interface StatusResponse {
  status: GenerationStatus;
  progress?: string;
  files?: GeneratedFile[];
  error?: string;
}

export interface GeneratedFile {
  url: string;
  version: number;
}

// Track Types
export interface Track {
  id: string;
  filename: string;
  url: string;
  taskId: string;
  style: MusicStyle;
  version: number;
  title: string;
  date: Date;
  size: string;
}

// Player Types
export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playlist: Track[];
}

// Console Message Types
export type ConsoleMessageType = 'info' | 'success' | 'process' | 'error';

export interface ConsoleMessage {
  id: string;
  text: string;
  type: ConsoleMessageType;
  timestamp: Date;
}

// Configuration Constants
export interface StyleConfig {
  label: string;
  icon: string;
  color: string;
  prompt: string;
}

export interface TextureConfig {
  label: string;
  icon: string;
  addition: string;
}

// Style Configuration - Prompts optimized for MusicGPT (max 300 chars total)
export const STYLE_CONFIG: Record<MusicStyle, StyleConfig> = {
  classic: {
    label: 'Classic Lo-Fi',
    icon: '🎹',
    color: 'cyan',
    prompt: 'Lo-fi hip-hop, 75 BPM, dusty vinyl drums, Rhodes piano, jazzy chords, muted bass, tape saturation, Nujabes style',
  },
  indian: {
    label: 'Indian Lo-Fi',
    icon: '🪷',
    color: 'orange',
    prompt: 'Indian lo-fi, 70 BPM, sitar melody, tabla drums, tanpura drone, raga-inspired, meditative spiritual atmosphere',
  },
  african: {
    label: 'African Lo-Fi',
    icon: '🥁',
    color: 'yellow',
    prompt: 'Afrobeats lo-fi, 95 BPM, djembe drums, kalimba melody, kora textures, polyrhythmic, warm African grooves',
  },
  asian: {
    label: 'Asian Lo-Fi',
    icon: '🎋',
    color: 'green',
    prompt: 'Japanese lo-fi, 65 BPM, koto plucks, shakuhachi flute, pentatonic melody, zen atmosphere, Studio Ghibli vibes',
  },
  latino: {
    label: 'Latino Lo-Fi',
    icon: '🌴',
    color: 'pink',
    prompt: 'Bossa nova lo-fi, 85 BPM, nylon guitar, brushed drums, Brazilian percussion, sunset beach vibes, romantic',
  },
  imported: {
    label: 'Imported',
    icon: '📁',
    color: 'gray',
    prompt: '',
  },
};

// Texture Configuration - Short additions for MusicGPT prompt limit
export const TEXTURE_CONFIG: Record<TextureType, TextureConfig> = {
  rain: {
    label: 'Rain',
    icon: '🌧️',
    addition: 'rain ambience, cozy atmosphere',
  },
  vinyl: {
    label: 'Vinyl',
    icon: '📀',
    addition: 'vinyl crackle, tape warmth',
  },
  city: {
    label: 'City',
    icon: '🌃',
    addition: 'city night ambience, urban vibes',
  },
  typing: {
    label: 'Typing',
    icon: '⌨️',
    addition: 'keyboard typing sounds, study room',
  },
};

// Style Colors for Tailwind Classes
export const STYLE_COLORS: Record<MusicStyle, string> = {
  classic: 'text-cyan-400 border-cyan-400',
  indian: 'text-orange-400 border-orange-400',
  african: 'text-yellow-400 border-yellow-400',
  asian: 'text-green-400 border-green-400',
  latino: 'text-pink-400 border-pink-400',
  imported: 'text-gray-400 border-gray-400',
};

// Helper function to get style label
export function getStyleLabel(style: MusicStyle): string {
  return STYLE_CONFIG[style].label;
}

// Helper function to build prompt (max 300 chars for MusicGPT API)
export function buildPrompt(style: MusicStyle, textures: TextureType[]): string {
  const basePrompt = STYLE_CONFIG[style].prompt;
  const textureAdditions = textures.map((t) => TEXTURE_CONFIG[t].addition);

  const textureString = textureAdditions.length > 0
    ? `, ${textureAdditions.join(', ')}`
    : '';

  const fullPrompt = `${basePrompt}${textureString}. Chill study beats.`;

  // Ensure max 300 characters (MusicGPT limit)
  return fullPrompt.slice(0, 300);
}
