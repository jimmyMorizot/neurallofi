# Execute - Implémentation TDD

Implémente une fonctionnalité en suivant la méthodologie TDD (Test-Driven Development).

## Workflow TDD

```
┌─────────────────────────────────────────────────────────┐
│                    CYCLE TDD                             │
│                                                          │
│   1. RED    →  Écrire un test qui échoue                │
│   2. GREEN  →  Écrire le code minimal pour passer       │
│   3. REFACTOR → Améliorer sans casser les tests         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Instructions

1. **Comprendre la tâche** : Relire le plan ou la spec
2. **Écrire le test** : Test unitaire ou d'intégration
3. **Vérifier l'échec** : `npm test` doit échouer
4. **Implémenter** : Code minimal pour passer le test
5. **Vérifier le succès** : `npm test` doit passer
6. **Refactorer** : Améliorer le code si nécessaire
7. **Répéter** : Prochaine fonctionnalité

## Conventions de test

```typescript
// Nom de fichier: [component].test.tsx ou [module].test.ts
// Structure:
describe('[Module/Component]', () => {
  describe('[Fonctionnalité]', () => {
    it('should [comportement attendu]', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Stack de test

- **Jest** : Runner de tests
- **React Testing Library** : Tests de composants
- **MSW** : Mocking des API

## Commandes

```bash
npm test              # Exécuter tous les tests
npm test -- --watch   # Mode watch
npm test -- [fichier] # Test spécifique
```

$ARGUMENTS
