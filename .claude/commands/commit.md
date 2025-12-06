# Commit - Création de commit Git

Crée un commit Git avec un message conventionnel.

## Format Conventional Commits

```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

## Types de commit

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactorisation |
| `perf` | Amélioration de performance |
| `test` | Ajout/modification de tests |
| `chore` | Maintenance (deps, config) |

## Scopes Neural_Lofi

| Scope | Description |
|-------|-------------|
| `generator` | Panneau de génération |
| `player` | Lecteur audio |
| `library` | Bibliothèque de tracks |
| `api` | Routes API |
| `ui` | Composants UI généraux |
| `hooks` | Hooks custom |

## Exemples

```bash
feat(generator): add texture selection toggles
fix(player): resolve crossfade timing issue
refactor(hooks): extract useAudioPlayer logic
docs(readme): update installation instructions
test(api): add library endpoint tests
```

## Instructions

1. Vérifier `git status` pour voir les changements
2. Vérifier `git diff` pour le contenu
3. Stager les fichiers pertinents
4. Créer le commit avec message conventionnel
5. Ne pas push automatiquement (sauf demande explicite)

$ARGUMENTS
