// ============================================
// Neural_Lofi - Type Definitions
// ============================================

// Music Generation Types
export type MusicStyle = 'classic' | 'indian' | 'african' | 'asian' | 'latino';

export type TextureType = 'rain' | 'vinyl' | 'city' | 'typing';

export type GenerationStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

// API Request/Response Types
export interface GenerationRequest {
  style: MusicStyle;
  textures: TextureType[];
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

// Style Configuration
export const STYLE_CONFIG: Record<MusicStyle, StyleConfig> = {
  classic: {
    label: 'Classic Lo-Fi',
    icon: '🎹',
    color: 'cyan',
    prompt: 'Chill LoFi hip-hop beat with mellow groove and nostalgic atmosphere',
  },
  indian: {
    label: 'Indian Lo-Fi',
    icon: '🪷',
    color: 'orange',
    prompt: 'Indian lofi with spiritual melodies, sitar textures, and meditative oriental vibes',
  },
  african: {
    label: 'African Lo-Fi',
    icon: '🥁',
    color: 'yellow',
    prompt: 'Afrobeats lofi with rhythmic grooves, organic textures, and warm percussion',
  },
  asian: {
    label: 'Asian Lo-Fi',
    icon: '🎋',
    color: 'green',
    prompt: 'Asian lofi with zen atmosphere, peaceful oriental melodies, and traditional instruments',
  },
  latino: {
    label: 'Latino Lo-Fi',
    icon: '🌴',
    color: 'pink',
    prompt: 'Bossa nova lofi with tropical rhythms, warm guitar, and sunset vibes',
  },
};

// Texture Configuration
export const TEXTURE_CONFIG: Record<TextureType, TextureConfig> = {
  rain: {
    label: 'Rain',
    icon: '🌧️',
    addition: 'ambient rain sounds',
  },
  vinyl: {
    label: 'Vinyl',
    icon: '📀',
    addition: 'warm vinyl crackle and tape saturation',
  },
  city: {
    label: 'City',
    icon: '🌃',
    addition: 'distant urban ambiance',
  },
  typing: {
    label: 'Typing',
    icon: '⌨️',
    addition: 'soft keyboard typing sounds',
  },
};

// Style Colors for Tailwind Classes
export const STYLE_COLORS: Record<MusicStyle, string> = {
  classic: 'text-cyan-400 border-cyan-400',
  indian: 'text-orange-400 border-orange-400',
  african: 'text-yellow-400 border-yellow-400',
  asian: 'text-green-400 border-green-400',
  latino: 'text-pink-400 border-pink-400',
};

// Helper function to get style label
export function getStyleLabel(style: MusicStyle): string {
  return STYLE_CONFIG[style].label;
}

// Helper function to build prompt
export function buildPrompt(style: MusicStyle, textures: TextureType[]): string {
  const basePrompt = STYLE_CONFIG[style].prompt;
  const textureAdditions = textures.map((t) => TEXTURE_CONFIG[t].addition);

  const textureString = textureAdditions.length > 0
    ? ` with ${textureAdditions.join(', ')}`
    : '';

  return `${basePrompt}${textureString}. Lofi, Chillhop, Calm, Vibe, Study Beats. Perfect for focus, studying, or relaxation.`;
}
