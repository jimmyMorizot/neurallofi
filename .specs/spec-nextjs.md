# Neural_Lofi - Spécifications Techniques

> Générateur de musique Lo-Fi propulsé par l'Intelligence Artificielle

---

## 🛠️ Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 15.x | Framework React avec App Router |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.x | Styling utility-first |
| **React** | 19.x | UI Components |
| **shadcn/ui** | latest | Composants UI accessibles et personnalisables |

---

## 🎨 shadcn/ui - Instructions MCP

> **IMPORTANT** : Utiliser le MCP shadcn/ui pour installer et gérer les composants.
> Documentation : https://ui.shadcn.com/docs/mcp

### Configuration MCP

Claude Code doit utiliser le serveur MCP shadcn/ui pour :
- Installer les composants via les outils MCP (pas `npx shadcn@latest add`)
- Accéder à la documentation des composants
- Obtenir les exemples de code

### Composants shadcn/ui recommandés

| Composant | Usage dans Neural_Lofi |
|-----------|------------------------|
| `button` | Boutons Generate, Play, Download |
| `card` | TrackCard, StyleCard |
| `badge` | Style badges, Version badges |
| `slider` | Volume control, Progress seek |
| `toggle` | Texture toggles |
| `progress` | Barre de progression génération |
| `dialog` | Modal générateur (mobile) |
| `sheet` | Drawer générateur (mobile) |
| `tooltip` | Infobulles sur les contrôles |
| `scroll-area` | Liste scrollable de tracks |

### Personnalisation du thème

Adapter les CSS variables shadcn/ui au thème Neural_Lofi cyberpunk :

```css
/* app/globals.css - Surcharge du thème shadcn */
@layer base {
  :root {
    --background: 240 10% 4%;        /* #0a0a0f */
    --foreground: 0 0% 100%;         /* white */
    --card: 240 10% 8%;              /* #12121a */
    --card-foreground: 0 0% 100%;
    --primary: 185 100% 50%;         /* #00f0ff cyan */
    --primary-foreground: 240 10% 4%;
    --secondary: 320 100% 50%;       /* #ff00aa magenta */
    --accent: 263 70% 58%;           /* #8b5cf6 purple */
    --muted: 240 10% 20%;
    --muted-foreground: 240 5% 65%;
    --border: 240 10% 20%;
    --ring: 185 100% 50%;            /* cyan glow */
  }
}
```

### Workflow d'installation

1. **Initialiser shadcn/ui** (si pas déjà fait) :
   ```bash
   npx shadcn@latest init
   ```

2. **Utiliser le MCP pour ajouter les composants** :
   - Claude Code accède au MCP shadcn/ui
   - Utiliser les outils MCP pour installer chaque composant nécessaire
   - Les composants sont installés dans `components/ui/`

3. **Personnaliser les composants** pour le thème cyberpunk :
   - Ajouter les effets glow
   - Appliquer les couleurs neon
   - Intégrer les animations custom

---

## 🎯 Vision du Projet

**Neural_Lofi** est une application web permettant de générer des morceaux de musique Lo-Fi personnalisés grâce à l'IA. L'utilisateur peut sélectionner un style musical, ajouter des textures sonores, et obtenir une composition unique parfaite pour la concentration, l'étude ou la relaxation.

---

## 🏗️ Architecture Next.js

### Structure du Projet

```
neural-lofi/
├── app/
│   ├── layout.tsx              # Layout principal avec PlayerBar
│   ├── page.tsx                # Page d'accueil (Générateur + Bibliothèque)
│   ├── globals.css             # Styles globaux + config Tailwind v4 + shadcn theme
│   └── api/
│       ├── generate/
│       │   └── route.ts        # POST - Lance une génération
│       ├── status/
│       │   └── [taskId]/
│       │       └── route.ts    # GET - Statut d'une génération
│       └── library/
│           └── route.ts        # GET - Liste des morceaux
├── components/
│   ├── ui/                     # Composants shadcn/ui (installés via MCP)
│   │   ├── button.tsx          # shadcn: button
│   │   ├── card.tsx            # shadcn: card
│   │   ├── badge.tsx           # shadcn: badge
│   │   ├── slider.tsx          # shadcn: slider
│   │   ├── toggle.tsx          # shadcn: toggle
│   │   ├── progress.tsx        # shadcn: progress
│   │   ├── dialog.tsx          # shadcn: dialog
│   │   ├── sheet.tsx           # shadcn: sheet
│   │   ├── tooltip.tsx         # shadcn: tooltip
│   │   └── scroll-area.tsx     # shadcn: scroll-area
│   ├── generator/
│   │   ├── GeneratorPanel.tsx  # Panneau de génération complet
│   │   ├── StyleSelector.tsx   # Sélecteur de style musical
│   │   ├── TextureSelector.tsx # Sélecteur de textures
│   │   ├── GenerateButton.tsx  # Bouton avec états
│   │   └── StatusConsole.tsx   # Console de statut
│   ├── library/
│   │   ├── Library.tsx         # Liste des tracks
│   │   └── TrackCard.tsx       # Card d'un morceau
│   └── player/
│       ├── PlayerBar.tsx       # Barre de lecture fixe
│       ├── PlayerControls.tsx  # Boutons play/pause/next/prev
│       ├── ProgressSeek.tsx    # Barre de progression
│       ├── VolumeControl.tsx   # Contrôle du volume
│       └── Visualizer.tsx      # Visualisation audio
├── hooks/
│   ├── useAudioPlayer.ts       # Hook de gestion audio
│   ├── useGeneration.ts        # Hook de génération IA
│   └── useLibrary.ts           # Hook de récupération bibliothèque
├── lib/
│   ├── musicgpt.ts             # Client API MusicGPT
│   ├── filesystem.ts           # Utilitaires système de fichiers
│   └── utils.ts                # Fonctions utilitaires
├── types/
│   └── index.ts                # Types TypeScript
├── public/
│   └── generated/
│       └── music/              # Fichiers MP3 générés
└── tailwind.config.ts          # Configuration Tailwind v4
```

### Philosophie Sans Base de Données

Neural_Lofi adopte une architecture **stateless** et **sans base de données**. Le système de fichiers fait office de source de vérité.

```
public/generated/music/
├── a1b2c3d4_classic_v1.mp3
├── a1b2c3d4_classic_v2.mp3
├── x7y8z9w0_indian_v1.mp3
└── ...
```

**Convention de nommage :** `{taskId}_{style}_v{version}.mp3`

---

## 📝 Types TypeScript

```typescript
// types/index.ts

export type MusicStyle = 'classic' | 'indian' | 'african' | 'asian' | 'latino';

export type TextureType = 'rain' | 'vinyl' | 'city' | 'typing';

export interface GenerationRequest {
  style: MusicStyle;
  textures: TextureType[];
}

export interface GenerationResponse {
  taskId: string;
  eta: number; // secondes
}

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

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

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  playlist: Track[];
}

export const STYLE_CONFIG: Record<MusicStyle, {
  label: string;
  icon: string;
  color: string;
}> = {
  classic: { label: 'Classic Lo-Fi', icon: '🎹', color: 'cyan' },
  indian: { label: 'Indian Lo-Fi', icon: '🪷', color: 'orange' },
  african: { label: 'African Lo-Fi', icon: '🥁', color: 'yellow' },
  asian: { label: 'Asian Lo-Fi', icon: '🎋', color: 'green' },
  latino: { label: 'Latino Lo-Fi', icon: '🌴', color: 'pink' },
};

export const TEXTURE_CONFIG: Record<TextureType, {
  label: string;
  icon: string;
}> = {
  rain: { label: 'Rain', icon: '🌧️' },
  vinyl: { label: 'Vinyl', icon: '📀' },
  city: { label: 'City', icon: '🌃' },
  typing: { label: 'Typing', icon: '⌨️' },
};
```

---

## 🎨 Configuration Tailwind CSS v4

```css
/* app/globals.css */

@import "tailwindcss";

@theme {
  /* Couleurs Neural_Lofi */
  --color-neural-bg: #0a0a0f;
  --color-neural-surface: #12121a;
  --color-neural-border: #1e1e2e;
  
  --color-neon-cyan: #00f0ff;
  --color-neon-magenta: #ff00aa;
  --color-neon-purple: #8b5cf6;
  --color-neon-pink: #ec4899;
  
  /* Glow effects */
  --shadow-glow-cyan: 0 0 20px rgba(0, 240, 255, 0.5);
  --shadow-glow-magenta: 0 0 20px rgba(255, 0, 170, 0.5);
  --shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.5);
  
  /* Typography */
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Animations */
  --animate-pulse-glow: pulse-glow 2s ease-in-out infinite;
  --animate-gradient: gradient-shift 8s ease infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: var(--shadow-glow-cyan); }
  50% { box-shadow: 0 0 30px rgba(0, 240, 255, 0.8); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Scanlines overlay */
.scanlines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}

/* Glassmorphism */
.glass {
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 🎵 Fonctionnalités

### 1. Génération de Musique IA

**Styles Disponibles :**

| Style | Code | Description |
|-------|------|-------------|
| Classic Lo-Fi | `classic` | Hip-hop Lo-Fi classique avec groove mellow |
| Indian Lo-Fi | `indian` | Mélodies spirituelles indiennes |
| African Lo-Fi | `african` | Afrobeats Lo-Fi avec grooves rythmiques |
| Asian Lo-Fi | `asian` | Atmosphère zen avec mélodies orientales |
| Latino Lo-Fi | `latino` | Bossa nova Lo-Fi avec rythmes tropicaux |

**Textures Sonores :**
- Rain, Vinyl, City, Typing

### 2. Lecteur Audio Avancé

- Play / Pause / Previous / Next
- Barre de progression cliquable (seek)
- Contrôle du volume
- Crossfade automatique (3 secondes)
- Visualisation audio réactive (Web Audio API)

### 3. Bibliothèque

- Liste des morceaux triés par date
- Affichage : titre, style, version, date
- Téléchargement direct MP3

---

## 🔌 API Routes

### POST `/api/generate`

```typescript
// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { GenerationRequest, GenerationResponse } from '@/types';

export async function POST(request: NextRequest) {
  const body: GenerationRequest = await request.json();
  
  // Appel MusicGPT API
  // ...
  
  return NextResponse.json<GenerationResponse>({
    taskId: 'abc123',
    eta: 120
  });
}
```

### GET `/api/status/[taskId]`

```typescript
// app/api/status/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { StatusResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  
  // Vérifier statut MusicGPT
  // ...
  
  return NextResponse.json<StatusResponse>({
    status: 'completed',
    files: [
      { url: `/generated/music/${taskId}_classic_v1.mp3`, version: 1 },
      { url: `/generated/music/${taskId}_classic_v2.mp3`, version: 2 }
    ]
  });
}
```

### GET `/api/library`

```typescript
// app/api/library/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Track, MusicStyle } from '@/types';

export async function GET() {
  const musicDir = path.join(process.cwd(), 'public/generated/music');
  
  try {
    const files = await fs.readdir(musicDir);
    const tracks: Track[] = [];
    
    for (const filename of files) {
      if (!filename.endsWith('.mp3')) continue;
      
      const filePath = path.join(musicDir, filename);
      const stats = await fs.stat(filePath);
      
      // Parse: {taskId}_{style}_v{version}.mp3
      const match = filename.match(/^(.+)_(.+)_v(\d+)\.mp3$/);
      if (!match) continue;
      
      const [, taskId, style, version] = match;
      
      tracks.push({
        id: `${taskId}_v${version}`,
        filename,
        url: `/generated/music/${filename}`,
        taskId,
        style: style as MusicStyle,
        version: parseInt(version),
        title: `${style.charAt(0).toUpperCase() + style.slice(1)} Lo-Fi #${taskId.slice(0, 4)} (v${version})`,
        date: stats.mtime,
        size: `${(stats.size / (1024 * 1024)).toFixed(1)} MB`
      });
    }
    
    // Tri par date décroissante
    tracks.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return NextResponse.json(tracks);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
```

---

## 🖥️ Composants React

### Exemple : GeneratorPanel (avec shadcn/ui)

```tsx
// components/generator/GeneratorPanel.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StyleSelector } from './StyleSelector';
import { TextureSelector } from './TextureSelector';
import { StatusConsole } from './StatusConsole';
import { useGeneration } from '@/hooks/useGeneration';
import type { MusicStyle, TextureType } from '@/types';
import { Loader2, Sparkles } from 'lucide-react';

export function GeneratorPanel() {
  const [selectedStyle, setSelectedStyle] = useState<MusicStyle>('classic');
  const [selectedTextures, setSelectedTextures] = useState<TextureType[]>([]);
  
  const { generate, status, progress, error, eta } = useGeneration();
  
  const handleGenerate = () => {
    generate({
      style: selectedStyle,
      textures: selectedTextures
    });
  };
  
  const isLoading = status === 'processing';
  
  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="text-neon-cyan font-mono text-lg">
          // GENERATE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <StyleSelector
          selected={selectedStyle}
          onSelect={setSelectedStyle}
        />
        
        <TextureSelector
          selected={selectedTextures}
          onToggle={(texture) => {
            setSelectedTextures(prev =>
              prev.includes(texture)
                ? prev.filter(t => t !== texture)
                : [...prev, texture]
            );
          }}
        />
        
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full h-12 bg-neon-cyan/20 hover:bg-neon-cyan/30 
                     text-neon-cyan border border-neon-cyan/50
                     shadow-[0_0_20px_rgba(0,240,255,0.3)]
                     hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]
                     transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
        
        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              ETA: {eta}s remaining
            </p>
          </div>
        )}
        
        <StatusConsole
          status={status}
          progress={progress}
          error={error}
        />
      </CardContent>
    </Card>
  );
}
```

### Exemple : TrackCard (avec shadcn/ui)

```tsx
// components/library/TrackCard.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Pause, Download } from 'lucide-react';
import type { Track } from '@/types';
import { STYLE_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function TrackCard({ track, isPlaying, onPlay, onPause }: TrackCardProps) {
  const styleConfig = STYLE_CONFIG[track.style];
  
  return (
    <Card 
      className={cn(
        "glass transition-all duration-300 hover:scale-[1.02]",
        isPlaying && "ring-2 ring-neon-cyan shadow-[0_0_20px_rgba(0,240,255,0.3)]"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-medium truncate">
              {track.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {styleConfig.icon} {styleConfig.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                v{track.version}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(track.date).toLocaleDateString('fr-FR')} • {track.size}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={isPlaying ? onPause : onPlay}
                  className="hover:bg-neon-cyan/20 hover:text-neon-cyan"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPlaying ? 'Pause' : 'Play'}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  asChild
                  className="hover:bg-neon-magenta/20 hover:text-neon-magenta"
                >
                  <a href={track.url} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download MP3</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎧 Hook Audio Player

```typescript
// hooks/useAudioPlayer.ts
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Track, PlayerState } from '@/types';

const CROSSFADE_DURATION = 3000; // 3 secondes

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    playlist: []
  });
  
  const play = useCallback((track: Track) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    audioRef.current.src = track.url;
    audioRef.current.volume = state.volume;
    audioRef.current.play();
    
    setState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true
    }));
  }, [state.volume]);
  
  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);
  
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else if (state.currentTrack) {
      audioRef.current?.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [state.isPlaying, state.currentTrack, pause]);
  
  const seek = useCallback((progress: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = progress * audioRef.current.duration;
    }
  }, []);
  
  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setState(prev => ({ ...prev, volume }));
  }, []);
  
  // Progress update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        progress: audio.currentTime / audio.duration || 0
      }));
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);
  
  return {
    ...state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume
  };
}
```

---

## 🚀 Intégration MusicGPT

```typescript
// lib/musicgpt.ts
import type { MusicStyle, TextureType } from '@/types';

const MUSICGPT_API_URL = process.env.MUSICGPT_API_URL!;
const MUSICGPT_API_KEY = process.env.MUSICGPT_API_KEY!;

const STYLE_PROMPTS: Record<MusicStyle, string> = {
  classic: 'Chill LoFi hip-hop beat with mellow groove and nostalgic atmosphere',
  indian: 'Indian lofi with spiritual melodies, sitar textures, and meditative oriental vibes',
  african: 'Afrobeats lofi with rhythmic grooves, organic textures, and warm percussion',
  asian: 'Asian lofi with zen atmosphere, peaceful oriental melodies, and traditional instruments',
  latino: 'Bossa nova lofi with tropical rhythms, warm guitar, and sunset vibes'
};

const TEXTURE_ADDITIONS: Record<TextureType, string> = {
  rain: 'ambient rain sounds',
  vinyl: 'warm vinyl crackle and tape saturation',
  city: 'distant urban ambiance',
  typing: 'soft keyboard typing sounds'
};

export async function generateMusic(style: MusicStyle, textures: TextureType[]) {
  const basePrompt = STYLE_PROMPTS[style];
  const texturePrompts = textures.map(t => TEXTURE_ADDITIONS[t]).join(', ');
  
  const fullPrompt = texturePrompts
    ? `${basePrompt} with ${texturePrompts}. Lofi, Chillhop, Calm, Vibe, Study Beats. Perfect for focus, studying, or relaxation.`
    : `${basePrompt}. Lofi, Chillhop, Calm, Vibe, Study Beats. Perfect for focus, studying, or relaxation.`;
  
  const response = await fetch(`${MUSICGPT_API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MUSICGPT_API_KEY}`
    },
    body: JSON.stringify({
      prompt: fullPrompt,
      musicStyle: `${style.charAt(0).toUpperCase() + style.slice(1)} Lo-fi`,
      makeInstrumental: true
    })
  });
  
  if (!response.ok) {
    throw new Error(`MusicGPT API error: ${response.statusText}`);
  }
  
  return response.json();
}

export async function checkStatus(taskId: string) {
  const response = await fetch(`${MUSICGPT_API_URL}/status/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${MUSICGPT_API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`MusicGPT API error: ${response.statusText}`);
  }
  
  return response.json();
}
```

---

## 🔧 Variables d'Environnement

```env
# .env.local
MUSICGPT_API_URL=https://api.musicgpt.com
MUSICGPT_API_KEY=your_api_key_here
```

---

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Générateur en drawer/modal, bibliothèque pleine largeur |
| Desktop (≥768px) | Deux colonnes : générateur (sidebar fixe) + bibliothèque |

---