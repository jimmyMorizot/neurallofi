# Plan d'Implémentation - Neural_Lofi

## Objectif

Implémenter l'application complète Neural_Lofi, un générateur de musique Lo-Fi propulsé par l'IA (MusicGPT), avec :
- Interface cyberpunk/neural avec design glassmorphism
- Panneau de génération (sélection style + textures)
- Bibliothèque de morceaux (scan filesystem)
- Lecteur audio avancé avec crossfade et visualisation
- Intégration API MusicGPT

## Architecture Cible

```
neural-lofi/
├── app/
│   ├── layout.tsx              # Layout avec PlayerBar fixe
│   ├── page.tsx                # Page principale (Generator + Library)
│   ├── globals.css             # Thème cyberpunk + shadcn
│   └── api/
│       ├── generate/route.ts   # POST - Génération MusicGPT
│       ├── status/[taskId]/route.ts  # GET - Statut
│       └── library/route.ts    # GET - Liste des tracks
├── components/
│   ├── ui/                     # shadcn/ui (10 composants)
│   ├── generator/              # 5 composants
│   ├── library/                # 2 composants
│   └── player/                 # 5 composants
├── hooks/                      # 3 hooks custom
├── lib/                        # 3 utilitaires
├── types/                      # Définitions TypeScript
└── public/generated/music/     # Stockage MP3
```

## Phases d'Implémentation

### Phase 1 : Fondations (Types + Config + shadcn)

#### 1.1 Types TypeScript
**Fichier** : `types/index.ts`
- `MusicStyle` : 'classic' | 'indian' | 'african' | 'asian' | 'latino'
- `TextureType` : 'rain' | 'vinyl' | 'city' | 'typing'
- `GenerationStatus` : 'pending' | 'processing' | 'completed' | 'failed'
- `GenerationRequest`, `GenerationResponse`, `StatusResponse`
- `Track`, `PlayerState`
- `STYLE_CONFIG`, `TEXTURE_CONFIG` (constantes avec labels/icons/colors)

#### 1.2 Configuration shadcn/ui
- Initialiser shadcn : `npx shadcn@latest init`
- Configurer le style "new-york" avec couleurs custom
- Installer les 10 composants requis via CLI :
  - button, card, badge, slider, toggle
  - progress, dialog, sheet, tooltip, scroll-area

#### 1.3 Thème Cyberpunk
**Fichier** : `app/globals.css`
- Variables CSS : --neural-bg, --neon-cyan, --neon-magenta, --neon-purple
- Surcharge shadcn avec palette cyberpunk
- Classes utilitaires : .glass, .scanlines, .text-glow
- Animations : pulse-glow, gradient-shift, bars-dance
- Import Google Font JetBrains Mono

#### 1.4 Utilitaires
**Fichier** : `lib/utils.ts`
- Fonction `cn()` pour class merging (clsx + tailwind-merge)
- Helpers de formatage (durée, taille fichier, date)

---

### Phase 2 : API Routes

#### 2.1 Route Library
**Fichier** : `app/api/library/route.ts`
- GET : Scanner `public/generated/music/`
- Parser les noms de fichiers : `{taskId}_{style}_v{version}.mp3`
- Extraire métadonnées filesystem (mtime, size)
- Retourner tableau de `Track[]` trié par date

#### 2.2 Route Generate
**Fichier** : `app/api/generate/route.ts`
- POST : Recevoir `{ style, textures }`
- Construire le prompt MusicGPT
- Appeler l'API MusicGPT
- Retourner `{ taskId, eta }`

#### 2.3 Route Status
**Fichier** : `app/api/status/[taskId]/route.ts`
- GET : Vérifier statut MusicGPT
- Si completed : télécharger fichiers MP3 dans `public/generated/music/`
- Retourner `StatusResponse`

#### 2.4 Client MusicGPT
**Fichier** : `lib/musicgpt.ts`
- `generateMusic(style, textures)` : Appel API génération
- `checkStatus(taskId)` : Vérification statut
- `downloadFile(url, destination)` : Téléchargement MP3
- Prompts par style (STYLE_PROMPTS)
- Textures additions (TEXTURE_ADDITIONS)

#### 2.5 Utilitaires Filesystem
**Fichier** : `lib/filesystem.ts`
- `scanMusicDirectory()` : Liste les MP3
- `parseFilename(filename)` : Extrait taskId, style, version
- `ensureDirectoryExists(path)` : Crée le dossier si nécessaire

---

### Phase 3 : Composants Generator

#### 3.1 StyleSelector
**Fichier** : `components/generator/StyleSelector.tsx`
- Grille 2x3 de cards cliquables
- Chaque style : icône + label + couleur
- État selected avec glow effect
- Props : `selected`, `onSelect`

#### 3.2 TextureSelector
**Fichier** : `components/generator/TextureSelector.tsx`
- 4 toggles horizontaux
- Multi-sélection possible
- Icône + label par texture
- Props : `selected[]`, `onToggle`

#### 3.3 GenerateButton
**Fichier** : `components/generator/GenerateButton.tsx`
- États : idle, loading, success, error
- Animation pulse pendant loading
- Icône Sparkles / Loader2
- Props : `onClick`, `isLoading`, `disabled`

#### 3.4 StatusConsole
**Fichier** : `components/generator/StatusConsole.tsx`
- Affichage type terminal
- Lignes avec timestamps
- Couleurs : success (vert), process (cyan), error (magenta)
- Curseur clignotant
- Props : `messages[]`, `status`

#### 3.5 GeneratorPanel
**Fichier** : `components/generator/GeneratorPanel.tsx`
- Card glass avec tous les sous-composants
- Titre "// GENERATE"
- Progress bar pendant génération
- Intègre `useGeneration` hook

---

### Phase 4 : Composants Library

#### 4.1 TrackCard
**Fichier** : `components/library/TrackCard.tsx`
- Card glass avec infos track
- Badges : style (couleur), version
- Métadonnées : date, taille
- Actions : Play/Pause, Download
- État playing avec glow cyan

#### 4.2 Library
**Fichier** : `components/library/Library.tsx`
- Header avec titre + count
- ScrollArea pour la liste
- Grille responsive (1-2-3 colonnes)
- État empty si pas de tracks
- Intègre `useLibrary` hook

---

### Phase 5 : Composants Player

#### 5.1 PlayerControls
**Fichier** : `components/player/PlayerControls.tsx`
- Boutons : Previous, Play/Pause, Next
- Icônes lucide-react
- Bouton central plus grand

#### 5.2 ProgressSeek
**Fichier** : `components/player/ProgressSeek.tsx`
- Barre de progression cliquable
- Temps actuel / durée totale
- Gradient cyan-purple
- Knob visible au hover

#### 5.3 VolumeControl
**Fichier** : `components/player/VolumeControl.tsx`
- Icône volume (avec états mute/low/high)
- Slider horizontal
- Props : `volume`, `onChange`

#### 5.4 Visualizer
**Fichier** : `components/player/Visualizer.tsx`
- 5 barres animées
- Animation bars-dance
- Couleurs alternées (purple, magenta, cyan)
- Pause quand audio pausé

#### 5.5 PlayerBar
**Fichier** : `components/player/PlayerBar.tsx`
- Footer fixe en bas
- Layout 3 colonnes : Info | Controls+Progress | Volume+Visualizer
- Info : titre track + status "PLAYING"
- Responsive : simplifié sur mobile
- Intègre `useAudioPlayer` hook

---

### Phase 6 : Hooks Custom

#### 6.1 useLibrary
**Fichier** : `hooks/useLibrary.ts`
- Fetch `/api/library` au mount
- État : `tracks[]`, `isLoading`, `error`
- Fonction `refresh()` pour recharger

#### 6.2 useGeneration
**Fichier** : `hooks/useGeneration.ts`
- Fonction `generate(request)`
- Polling automatique du statut
- États : `status`, `progress`, `error`, `eta`
- Callback `onComplete` pour refresh library

#### 6.3 useAudioPlayer
**Fichier** : `hooks/useAudioPlayer.ts`
- Gestion HTMLAudioElement
- État : `currentTrack`, `isPlaying`, `progress`, `volume`, `playlist`
- Actions : `play`, `pause`, `togglePlay`, `seek`, `setVolume`, `next`, `prev`
- Crossfade 3s entre tracks
- Event listeners : timeupdate, ended

---

### Phase 7 : Layout et Page

#### 7.1 Layout Principal
**Fichier** : `app/layout.tsx`
- Metadata : titre "Neural_Lofi", description
- Import JetBrains Mono
- Body avec classes : font-mono, bg-neural-bg
- Overlay scanlines (optionnel)
- PlayerBar fixe (via context ou prop drilling)

#### 7.2 Page d'Accueil
**Fichier** : `app/page.tsx`
- Layout responsive :
  - Mobile : Header + Library + FAB pour Generator (Sheet)
  - Desktop : Sidebar Generator (360px) + Main Library
- Background gradient animé
- AudioPlayerProvider context

---

### Phase 8 : Finalisation

#### 8.1 Variables d'Environnement
**Fichier** : `.env.local.example`
- `MUSICGPT_API_URL`
- `MUSICGPT_API_KEY`

#### 8.2 Dossier Génération
- Créer `public/generated/music/.gitkeep`
- Ajouter au `.gitignore` : `public/generated/music/*.mp3`

#### 8.3 Tests Manuels
- Vérifier responsive design
- Tester flux de génération complet
- Valider lecteur audio (play, pause, seek, volume)
- Vérifier crossfade entre tracks

---

## Fichiers Impactés (Total: ~25 fichiers)

| Fichier | Action | Description |
|---------|--------|-------------|
| `types/index.ts` | Créer | Définitions TypeScript |
| `lib/utils.ts` | Créer | Utilitaires (cn, formatters) |
| `lib/musicgpt.ts` | Créer | Client API MusicGPT |
| `lib/filesystem.ts` | Créer | Utilitaires filesystem |
| `app/globals.css` | Modifier | Thème cyberpunk complet |
| `app/layout.tsx` | Modifier | Layout avec PlayerBar |
| `app/page.tsx` | Modifier | Page principale |
| `app/api/library/route.ts` | Créer | API liste tracks |
| `app/api/generate/route.ts` | Créer | API génération |
| `app/api/status/[taskId]/route.ts` | Créer | API statut |
| `components/ui/*` | Créer | 10 composants shadcn |
| `components/generator/*` | Créer | 5 composants |
| `components/library/*` | Créer | 2 composants |
| `components/player/*` | Créer | 5 composants |
| `hooks/useLibrary.ts` | Créer | Hook bibliothèque |
| `hooks/useGeneration.ts` | Créer | Hook génération |
| `hooks/useAudioPlayer.ts` | Créer | Hook audio |
| `components.json` | Créer | Config shadcn |
| `.env.local.example` | Créer | Template env |

---

## Dépendances à Installer

```bash
# shadcn/ui dependencies
pnpm add clsx tailwind-merge class-variance-authority
pnpm add @radix-ui/react-dialog @radix-ui/react-slot
pnpm add @radix-ui/react-tooltip @radix-ui/react-toggle
pnpm add @radix-ui/react-progress @radix-ui/react-slider
pnpm add @radix-ui/react-scroll-area

# Icons
pnpm add lucide-react
```

---

## Risques et Considérations

1. **API MusicGPT** : Nécessite clé API valide pour tests réels
   - Mitigation : Mode mock pour développement

2. **Crossfade Audio** : Complexité Web Audio API
   - Mitigation : Commencer simple, itérer

3. **Performance Scanning** : Si beaucoup de fichiers MP3
   - Mitigation : Pagination si > 100 tracks

4. **Responsive PlayerBar** : Layout complexe
   - Mitigation : Mobile-first, simplifier sur petits écrans

---

## Critères de Succès

- [ ] shadcn/ui initialisé avec thème cyberpunk
- [ ] Types TypeScript complets et utilisés partout
- [ ] API `/api/library` retourne les tracks du filesystem
- [ ] API `/api/generate` accepte les requêtes (mode mock OK)
- [ ] API `/api/status/[taskId]` gère le polling
- [ ] GeneratorPanel fonctionnel avec sélection style/textures
- [ ] Library affiche les tracks avec design conforme à la maquette
- [ ] PlayerBar permet play/pause/seek/volume
- [ ] Design responsive (mobile + desktop)
- [ ] Effets visuels : glassmorphism, glow, scanlines

---

## Ordre d'Exécution Recommandé

1. **Phase 1** : Fondations (2-3h)
2. **Phase 2** : API Routes (2h)
3. **Phase 3** : Generator (2h)
4. **Phase 4** : Library (1h)
5. **Phase 5** : Player (2h)
6. **Phase 6** : Hooks (1.5h)
7. **Phase 7** : Layout/Page (1h)
8. **Phase 8** : Finalisation (0.5h)

**Estimation totale** : ~12h de développement
