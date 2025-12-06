# Plan - Planification de tâche

Analyse la demande de l'utilisateur et crée un plan d'implémentation détaillé.

## Instructions

1. **Comprendre le contexte** : Lis les fichiers `.specs/` pour comprendre les spécifications du projet Neural_Lofi
2. **Analyser la demande** : Identifie clairement ce qui est demandé
3. **Explorer le code existant** : Utilise Glob et Grep pour comprendre la structure actuelle
4. **Identifier les dépendances** : Liste les fichiers qui seront impactés
5. **Créer le plan** : Structure les étapes d'implémentation

## Format du plan

```markdown
## Objectif
[Description claire de l'objectif]

## Fichiers impactés
- [fichier1.tsx] - [raison]
- [fichier2.ts] - [raison]

## Étapes d'implémentation
1. [Étape 1]
   - Détails
2. [Étape 2]
   - Détails

## Risques et considérations
- [Risque potentiel]

## Critères de succès
- [ ] [Critère 1]
- [ ] [Critère 2]
```

## Contexte projet

- Stack : Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- Architecture : App Router, stateless (pas de BDD)
- Specs : `.specs/spec.md` et `.specs/spec-nextjs.md`

$ARGUMENTS
