# Fix - Correction de bug

Analyse et corrige un bug de manière méthodique.

## Workflow de debugging

```
┌─────────────────────────────────────────────────────────┐
│                 PROCESSUS DE FIX                         │
│                                                          │
│   1. REPRODUCE  →  Reproduire le bug                    │
│   2. ISOLATE    →  Identifier la cause racine           │
│   3. FIX        →  Implémenter la correction            │
│   4. TEST       →  Vérifier la correction               │
│   5. PREVENT    →  Ajouter un test de régression        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Instructions

1. **Comprendre le bug** : Quel est le comportement attendu vs observé ?
2. **Reproduire** : Identifier les étapes pour reproduire
3. **Analyser** : Utiliser les logs, le debugger, les stack traces
4. **Localiser** : Trouver le fichier et la ligne responsable
5. **Corriger** : Implémenter le fix minimal
6. **Tester** : Vérifier que le bug est résolu
7. **Régression** : Ajouter un test pour prévenir la récurrence

## Template de rapport

```markdown
## Bug Report

### Description
[Description du bug]

### Reproduction
1. [Étape 1]
2. [Étape 2]
3. [Bug observé]

### Comportement attendu
[Ce qui devrait se passer]

### Cause racine
[Explication technique]

### Correction
- Fichier: [path]
- Changement: [description]

### Test de régression
[Test ajouté pour prévenir la récurrence]
```

## Outils de debug

- `console.log()` / `console.error()`
- React DevTools
- Network tab (DevTools)
- `npm run lint` pour erreurs de syntaxe

$ARGUMENTS
