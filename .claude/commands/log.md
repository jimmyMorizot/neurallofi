# Log - Documentation des changements

Documente les changements effectués dans un format structuré.

## Instructions

1. **Résumer** : Qu'est-ce qui a été fait ?
2. **Détailler** : Quels fichiers ont été modifiés ?
3. **Expliquer** : Pourquoi ces choix ?
4. **Documenter** : Impact sur le projet

## Format de log

```markdown
# Changelog - [Date]

## Résumé
[Description courte des changements]

## Changements détaillés

### Fichiers créés
- `path/to/file.tsx` - [description]

### Fichiers modifiés
- `path/to/file.tsx` - [description des modifications]

### Fichiers supprimés
- `path/to/file.tsx` - [raison de la suppression]

## Décisions techniques
- [Décision 1] : [Justification]
- [Décision 2] : [Justification]

## Tests
- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests d'intégration passent
- [ ] Build réussit

## Notes pour la suite
- [Point d'attention]
- [Amélioration future possible]
```

## Bonnes pratiques

- Écrire le log immédiatement après les changements
- Être précis sur les fichiers et lignes modifiés
- Expliquer le "pourquoi" pas seulement le "quoi"
- Mentionner les breaking changes

$ARGUMENTS
