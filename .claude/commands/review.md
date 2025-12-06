# Review - Revue de code

Effectue une revue de code approfondie selon les standards du projet.

## Instructions

1. **Lire le code** : Analyse les fichiers modifiés ou spécifiés
2. **Vérifier les standards** : Conformité avec les conventions du projet
3. **Identifier les problèmes** : Bugs, vulnérabilités, code smells
4. **Suggérer des améliorations** : Optimisations et bonnes pratiques

## Checklist de revue

### Conformité aux Spécifications
- [ ] Fonctionnalités conformes à `.specs/spec.md`
- [ ] Interface conforme à `.specs/maquette.html`
- [ ] Implémentation technique conforme à `.specs/spec-nextjs.md`

### Architecture & Design
- [ ] Respect des patterns Next.js App Router
- [ ] Séparation des responsabilités (components, hooks, lib)
- [ ] Utilisation correcte des Server/Client Components

### TypeScript
- [ ] Types explicites (pas de `any`)
- [ ] Interfaces bien définies dans `types/`
- [ ] Inférence de types appropriée

### React
- [ ] Hooks utilisés correctement (règles des hooks)
- [ ] Pas de re-renders inutiles
- [ ] Props typées et validées

### Performance
- [ ] Pas de dépendances circulaires
- [ ] Lazy loading approprié
- [ ] Memoization si nécessaire

### Sécurité
- [ ] Pas de secrets exposés
- [ ] Validation des entrées utilisateur
- [ ] Pas d'injection (XSS, SQL)

### Tailwind CSS
- [ ] Classes utilitaires cohérentes
- [ ] Respect du design system Neural_Lofi
- [ ] Responsive design

## Format de sortie

```markdown
## Résumé
[Résumé global de la revue]

## Problèmes critiques
- 🔴 [Problème] - [Fichier:ligne]

## Suggestions d'amélioration
- 🟡 [Suggestion] - [Fichier:ligne]

## Points positifs
- 🟢 [Bon point]

## Score: X/10
```

$ARGUMENTS
