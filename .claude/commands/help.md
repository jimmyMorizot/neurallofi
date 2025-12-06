# Help - Aide AIDD

Guide d'utilisation des commandes AIDD pour Claude Code.

## Commandes disponibles

| Commande | Description | Usage |
|----------|-------------|-------|
| `/plan` | Planifier une implémentation | `/plan Ajouter le bouton de génération` |
| `/task` | Créer un épic structuré | `/task Implémenter le lecteur audio` |
| `/review` | Revue de code | `/review components/player/` |
| `/execute` | Implémenter en TDD | `/execute Task 1 du plan` |
| `/fix` | Corriger un bug | `/fix Le player ne démarre pas` |
| `/optimize` | Optimiser les performances | `/optimize components/Library.tsx` |
| `/refactor` | Refactoriser du code | `/refactor hooks/useAudioPlayer.ts` |
| `/commit` | Créer un commit | `/commit` |
| `/log` | Documenter les changements | `/log` |
| `/discover` | Explorer le projet | `/discover` |

## Workflow recommandé

```
┌─────────────────────────────────────────────────────────┐
│                  WORKFLOW AIDD                           │
│                                                          │
│   1. /discover  →  Comprendre le projet                 │
│   2. /plan      →  Planifier l'implémentation           │
│   3. /task      →  Créer les tâches                     │
│   4. /execute   →  Implémenter (TDD)                    │
│   5. /review    →  Vérifier la qualité                  │
│   6. /commit    →  Sauvegarder les changements          │
│   7. /log       →  Documenter                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Skills disponibles

- **TypeScript** : Best practices typage
- **React** : Patterns et hooks
- **Next.js** : App Router, Server Components
- **Tailwind CSS** : Utility-first styling
- **TDD** : Test-Driven Development
- **UI/UX** : Design cyberpunk Neural_Lofi
- **API Design** : REST API avec MusicGPT

## Contexte projet

- **Projet** : Neural_Lofi - Générateur de musique Lo-Fi IA
- **Stack** : Next.js 16, React 19, TypeScript 5, Tailwind 4
- **Specs** : `.specs/spec.md`, `.specs/spec-nextjs.md`

## Tips

- Utilise `/discover` en premier pour comprendre le projet
- Combine `/plan` + `/task` pour les grandes fonctionnalités
- Lance `/review` après chaque implémentation significative
- Fais des commits fréquents avec `/commit`
