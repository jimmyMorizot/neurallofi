# Refactor - Refactorisation de code

Améliore la structure du code sans changer son comportement.

## Principes de refactoring

### SOLID
- **S**ingle Responsibility : Une classe/fonction = une responsabilité
- **O**pen/Closed : Ouvert à l'extension, fermé à la modification
- **L**iskov Substitution : Substitution sans casser le comportement
- **I**nterface Segregation : Interfaces spécifiques plutôt que générales
- **D**ependency Inversion : Dépendre des abstractions

### DRY (Don't Repeat Yourself)
- Extraire les patterns répétés en fonctions/composants
- Créer des hooks custom pour la logique réutilisable
- Utiliser des composants composés

### KISS (Keep It Simple, Stupid)
- Préférer la simplicité à la complexité
- Code lisible > code clever
- Éviter l'over-engineering

## Patterns de refactoring courants

```typescript
// Extract Component
// Avant: composant monolithique
// Après: composants atomiques réutilisables

// Extract Hook
// Avant: logique dans le composant
// Après: hook custom réutilisable

// Extract Function
// Avant: logique inline complexe
// Après: fonction utilitaire testable

// Rename
// Améliorer les noms pour la clarté
```

## Workflow

1. **Identifier** : Code smell ou duplication
2. **Tester** : S'assurer que les tests existent
3. **Refactorer** : Petits changements incrémentaux
4. **Vérifier** : Tests toujours verts
5. **Commiter** : Un commit par refactoring

## Code smells à identifier

- Fonctions > 20 lignes
- Composants > 100 lignes
- Plus de 3 niveaux d'indentation
- Duplication de code
- Noms cryptiques

$ARGUMENTS
