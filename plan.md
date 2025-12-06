# Plan - Corrections UI/UX Library

## Objectif

Corriger les problèmes UI/UX identifiés sur les screenshots :

1. **Modal de suppression** → Ne s'affiche pas centrée (apparaît en bas de l'écran)
2. **Filtre "Favorites" redondant** → Le coeur existe déjà dans chaque card
3. **Bouton Export inutile** → Download existe dans chaque card, garder seulement Import en plus visible
4. **Cards trop petites** → Le titre est tronqué, manque d'espace
5. **Manque de structure** → Grouper les tracks par catégorie (Classic, African, etc.)

---

## Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| `app/globals.css` | Fix modal centrage, styles sections catégorie, agrandir cards, bouton Import |
| `components/library/Library.tsx` | Supprimer filter bar, ajouter groupement par catégorie, simplifier interface |
| `components/library/TrackCard.tsx` | Agrandir les cards, titre sur 2 lignes max |
| `app/page.tsx` | Supprimer props obsolètes (showFavoritesFilter, onExport) |
| `components/sidebar/FavoritesSection.tsx` | À conserver ou supprimer selon décision |

---

## Étapes d'implémentation

### Étape 1 : Fix Modal de suppression
- Retirer `position: relative` et `overflow: hidden` du CSS `.delete-dialog`
- S'assurer que le Dialog shadcn reste centré (`fixed top-[50%] left-[50%]`)

### Étape 2 : Simplifier la barre de filtre
- Supprimer le bouton "Favorites" de la Library
- Supprimer le bouton "Export"
- Garder uniquement "Import MP3" en plus gros et visible
- Afficher le compteur de tracks

### Étape 3 : Grouper les tracks par catégorie
- Grouper les tracks par `style` (Classic, Indian, African, Asian, Latino)
- Ajouter des section headers pour chaque catégorie
- Afficher l'icône et le nom de la catégorie
- Afficher le nombre de tracks par catégorie

### Étape 4 : Agrandir les TrackCards
- Augmenter le `min-width` des cards dans la grille
- Permettre au titre de s'afficher sur 2 lignes (`line-clamp-2`)
- Meilleur espacement interne (padding)

### Étape 5 : Nettoyer les props obsolètes
- Retirer `onExport`, `externalShowFavorites`, `onFavoritesFilterChange` de Library
- Mettre à jour `app/page.tsx` pour ne plus passer ces props
- Décider si FavoritesSection dans sidebar est toujours pertinente

---

## CSS à ajouter

```css
/* Import button - Plus visible */
.import-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(111, 231, 243, 0.1);
  border: 1px solid var(--cyan-ice);
  color: var(--cyan-ice);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Section headers par catégorie */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid;
  background: rgba(255, 255, 255, 0.02);
}

/* Track cards plus grandes */
.tracks-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.track-card {
  padding: 1.75rem;
}

.track-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## Risques et considérations

- **FavoritesSection** : Si on la garde dans la sidebar, il faut qu'elle serve à quelque chose (peut-être filtrer uniquement les favoris ?)
- **Mobile** : Vérifier que le groupement par catégorie fonctionne bien sur mobile
- **Performance** : Le regroupement par catégorie ne devrait pas impacter les performances

---

## Critères de succès

- [ ] Modal de suppression centrée au milieu de l'écran
- [ ] Plus de filtre "Favorites" redondant dans la Library
- [ ] Bouton "Import MP3" bien visible, pas d'Export
- [ ] Titres des tracks lisibles (pas tronqués)
- [ ] Tracks groupées par catégorie avec headers visuels
- [ ] Cards plus grandes et aérées
- [ ] Design cohérent avec l'esthétique cyberpunk

---

## Décision requise

> **Question** : Voulez-vous garder la section "Favorites" dans la sidebar gauche ?
> Si oui, elle filtrera les tracks pour n'afficher que les favoris.
> Si non, elle sera supprimée.

---

**Statut** : En attente de validation

Lancez `/task` pour créer les tâches d'implémentation.
