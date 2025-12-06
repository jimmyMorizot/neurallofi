# Task - Création d'épic structuré

Transforme une demande en épic structuré avec des tâches atomiques.

## Instructions

1. **Analyser la demande** : Comprendre le scope complet
2. **Décomposer en tâches** : Créer des tâches atomiques et testables
3. **Définir les critères** : Chaque tâche doit avoir des critères d'acceptation clairs
4. **Estimer la complexité** : Identifier les tâches simples vs complexes

## Format de sortie

```markdown
# Epic: [Nom de l'épic]

## Vue d'ensemble
[Description de l'épic]

## Tâches

### Task 1: [Nom]
- **Fichiers**: [liste des fichiers]
- **Actions**:
  - [ ] Action 1
  - [ ] Action 2
- **Tests**: [tests à écrire/exécuter]
- **Critères d'acceptation**:
  - [ ] Critère 1

### Task 2: [Nom]
...

## Ordre d'exécution
1. Task X (prerequisite)
2. Task Y (dépend de X)
3. Task Z (parallélisable avec Y)

## Definition of Done
- [ ] Tous les tests passent
- [ ] Code review effectuée
- [ ] Build réussit sans erreur
```

## Bonnes pratiques

- Tâches de 30 min à 2h max
- Une seule responsabilité par tâche
- Tests définis avant l'implémentation (TDD)
- Dépendances explicites

$ARGUMENTS
