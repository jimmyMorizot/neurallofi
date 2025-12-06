# Optimize - Optimisation des performances

Analyse et optimise les performances de l'application.

## Domaines d'optimisation

### 1. Performance React
- Memoization (`useMemo`, `useCallback`, `React.memo`)
- Lazy loading (`dynamic` imports)
- Suspense boundaries
- Éviter les re-renders inutiles

### 2. Performance Next.js
- Server Components vs Client Components
- Static Generation vs Server-Side Rendering
- Image optimization (`next/image`)
- Route prefetching

### 3. Performance CSS/Tailwind
- Purge des classes non utilisées
- Critical CSS
- Éviter les recalculs de layout

### 4. Performance Audio (spécifique Neural_Lofi)
- Préchargement des fichiers audio
- Crossfade optimisé
- Web Audio API efficient

## Workflow d'optimisation

```
┌─────────────────────────────────────────────────────────┐
│              PROCESSUS D'OPTIMISATION                   │
│                                                          │
│   1. MEASURE   →  Mesurer les performances actuelles    │
│   2. ANALYZE   →  Identifier les bottlenecks            │
│   3. OPTIMIZE  →  Appliquer les optimisations           │
│   4. VERIFY    →  Mesurer l'amélioration                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Outils de mesure

```bash
# Lighthouse
npm run build && npm run start
# Ouvrir Chrome DevTools > Lighthouse

# Bundle analyzer
npm run build -- --analyze

# Core Web Vitals
# Utiliser useReportWebVitals dans Next.js
```

## Checklist d'optimisation

- [ ] Bundle size < 200KB (first load)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Pas de layout shifts visibles

$ARGUMENTS
