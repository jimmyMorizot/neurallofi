# Discover - Exploration du projet

Explore et documente la structure du projet Neural_Lofi.

## Instructions

1. **Scanner la structure** : Analyser l'arborescence des fichiers
2. **Identifier les patterns** : Conventions utilisées
3. **Mapper les dépendances** : Relations entre modules
4. **Documenter** : Créer une carte mentale du projet

## Points d'exploration

### Structure du projet
```
neural-lofi/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Page d'accueil
│   ├── globals.css       # Styles globaux
│   └── api/              # Routes API
├── components/           # Composants React
│   ├── ui/               # shadcn/ui
│   ├── generator/        # Panneau de génération
│   ├── library/          # Bibliothèque
│   └── player/           # Lecteur audio
├── hooks/                # Hooks custom
├── lib/                  # Utilitaires
├── types/                # Types TypeScript
└── public/               # Assets statiques
```

### Questions à explorer

- [ ] Quels composants existent ?
- [ ] Comment sont structurées les routes API ?
- [ ] Quels hooks sont disponibles ?
- [ ] Comment est géré l'état global ?
- [ ] Quelles sont les conventions de nommage ?

## Format de sortie

```markdown
## Architecture du projet

### Composants principaux
[Liste et description]

### Flux de données
[Diagramme ou description]

### Points d'entrée
[Routes, API endpoints]

### Dépendances externes
[Libraries utilisées et leur rôle]

### Conventions
[Patterns et standards du projet]
```

$ARGUMENTS
