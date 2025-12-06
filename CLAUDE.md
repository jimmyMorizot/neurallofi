# Neural_Lofi - Guide Claude Code

## Vue d'ensemble

**Neural_Lofi** est un générateur de musique Lo-Fi propulsé par l'IA (MusicGPT).

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16.x | Framework React (App Router) |
| React | 19.x | UI Components |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Styling utility-first |
| shadcn/ui | latest | Composants UI |

## Architecture

```
neural-lofi/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page d'accueil
│   ├── globals.css         # Styles + thème
│   └── api/                # Routes API
│       ├── generate/       # POST - Génération
│       ├── status/[taskId] # GET - Statut
│       └── library/        # GET - Bibliothèque
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── generator/          # Panneau de génération
│   ├── library/            # Liste des tracks
│   └── player/             # Lecteur audio
├── hooks/                  # Hooks custom
├── lib/                    # Utilitaires
├── types/                  # Types TypeScript
└── public/generated/music/ # Fichiers MP3
```

## Spécifications

- **Specs fonctionnelles** : `.specs/spec.md`
- **Specs techniques** : `.specs/spec-nextjs.md`
- **Maquette de référence** : `.specs/maquette.html`

## Commandes AIDD

| Commande | Description |
|----------|-------------|
| `/plan` | Planifier une implémentation |
| `/task` | Créer un épic structuré |
| `/review` | Revue de code |
| `/execute` | Implémenter en TDD |
| `/fix` | Corriger un bug |
| `/optimize` | Optimiser les performances |
| `/refactor` | Refactoriser du code |
| `/commit` | Créer un commit |
| `/log` | Documenter les changements |
| `/discover` | Explorer le projet |
| `/help` | Aide AIDD |

## Conventions

### Nommage des fichiers MP3
```
{taskId}_{style}_v{version}.mp3
```
- `taskId` : ID retourné par MusicGPT
- `style` : classic, indian, african, asian, latino
- `version` : 1 ou 2

### Types principaux
```typescript
type MusicStyle = 'classic' | 'indian' | 'african' | 'asian' | 'latino';
type TextureType = 'rain' | 'vinyl' | 'city' | 'typing';
type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

### Design System
- Palette : Cyberpunk/Neural avec accents neon (cyan, magenta, purple)
- Font : JetBrains Mono
- Effets : Glassmorphism, Glow, Scanlines

## Workflow recommandé

1. `/discover` - Comprendre le projet
2. `/plan` - Planifier l'implémentation
3. `/task` - Créer les tâches
4. `/execute` - Implémenter en TDD
5. `/review` - Vérifier la qualité
6. `/commit` - Sauvegarder

## Notes importantes

- Architecture **stateless** (pas de BDD)
- Persistance via **système de fichiers**
- **Server Components** par défaut, `'use client'` pour l'interactivité
- Tests avec **Jest + React Testing Library**
