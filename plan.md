# Plan - Rebranding & PWA Neural Lofi

## Objectif

1. **Rebranding des titres** : Remplacer les formats "// LIBRARY_DATABASE", "NEURAL_LOFI" avec underscores par des titres plus elegants et modernes
2. **PWA complete** : Transformer l'app en Progressive Web App installable avec manifest, icones, service worker et popup d'installation intelligente

---

## Fichiers impactes

| Fichier | Modification |
|---------|--------------|
| `app/layout.tsx` | Metadata, favicon, manifest link, viewport PWA |
| `app/page.tsx` | Logo "Neural Lofi", titres des sections |
| `app/globals.css` | Style du nouveau logo + popup PWA |
| `public/manifest.json` | **NOUVEAU** - Manifest PWA |
| `public/icons/` | **NOUVEAU** - Icones PWA (192x192, 512x512) |
| `public/favicon.ico` | **NOUVEAU** - Favicon navigateur |
| `components/pwa/InstallPrompt.tsx` | **NOUVEAU** - Popup d'installation PWA |
| `hooks/usePWAInstall.ts` | **NOUVEAU** - Hook gestion installation PWA |

---

## Etapes d'implementation

### Phase 1 : Rebranding des titres

#### 1.1 Renommer le logo
| Avant | Apres |
|-------|-------|
| `NEURAL_LOFI` | `Neural Lofi` |

Fichiers a modifier :
- `app/page.tsx:55` - Header mobile
- `app/page.tsx:60` - Sidebar desktop
- `app/layout.tsx:14` - Metadata title
- `app/layout.tsx:18` - Metadata authors

#### 1.2 Renommer les titres de sections
| Avant | Apres |
|-------|-------|
| `// LIBRARY_DATABASE` | `Library` |
| `// CREATE_TRACK` | `Create` |

Fichiers a modifier :
- `app/page.tsx:71` - Titre library desktop
- `app/page.tsx:92` - Titre library mobile
- `app/page.tsx:110` - Titre create mobile

#### 1.3 Mettre a jour le CSS du logo
- Garder le gradient cyan-pink
- Ajouter un effet glow subtil
- Espacement entre "Neural" et "Lofi"

---

### Phase 2 : Assets PWA

#### 2.1 Creer les icones
Generer des icones aux formats :
```
public/
├── favicon.ico          (32x32)
├── apple-touch-icon.png (180x180)
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

Design : Onde sonore stylisee ou "N" avec effet neon gradient cyan/pink sur fond sombre

#### 2.2 Creer le manifest.json
```json
{
  "name": "Neural Lofi",
  "short_name": "Neural Lofi",
  "description": "AI-powered Lo-Fi music generator",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#050511",
  "theme_color": "#050511",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### 2.3 Mettre a jour layout.tsx
Ajouter dans `<head>` :
```tsx
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

### Phase 3 : Popup d'installation PWA

#### 3.1 Creer le hook usePWAInstall
```typescript
// hooks/usePWAInstall.ts
interface UsePWAInstall {
  canInstall: boolean;      // L'event beforeinstallprompt a ete capture
  isInstalled: boolean;     // App deja installee (display-mode: standalone)
  isDismissed: boolean;     // User a clique "Ne plus demander"
  promptInstall: () => void; // Declenche l'installation
  dismissForever: () => void; // Masque definitivement
}
```

Logique :
1. Capturer `beforeinstallprompt` event
2. Verifier `window.matchMedia('(display-mode: standalone)')`
3. Lire/ecrire `localStorage.getItem('pwa-dismissed')`

#### 3.2 Creer le composant InstallPrompt
```typescript
// components/pwa/InstallPrompt.tsx
```

Design cyberpunk :
- Glassmorphism (backdrop-blur + border subtle)
- Glow neon cyan/pink
- Position : fixed bottom avec animation slide-up
- Contenu :
  - Icone de l'app (32x32)
  - Titre : "Installer Neural Lofi"
  - Description : "Acces rapide et experience optimale"
  - Bouton "Installer" (style cyan neon)
  - Bouton "Plus tard" (style ghost)
  - Checkbox "Ne plus demander"

#### 3.3 Integrer dans la page
Ajouter `<InstallPrompt />` dans `app/page.tsx` (composant client)

---

## Criteres de succes

- [ ] Logo affiche "Neural Lofi" (sans underscore ni //)
- [ ] Titres de sections elegants : "Library", "Create"
- [ ] Favicon visible dans l'onglet du navigateur
- [ ] manifest.json valide (Chrome DevTools > Application > Manifest)
- [ ] Popup d'installation s'affiche sur Chrome/Edge (desktop + mobile)
- [ ] L'utilisateur peut cliquer "Ne plus demander" et la popup disparait definitivement
- [ ] L'app est installable comme PWA
- [ ] Design de la popup coherent avec le theme cyberpunk

---

## Notes techniques

### Support navigateur pour beforeinstallprompt
- Chrome/Edge : Supporte
- Firefox : Non supporte (pas de popup, installation manuelle)
- Safari iOS : Non supporte (instructions manuelles "Ajouter a l'ecran d'accueil")

### Generation des icones
Option 1 : Utiliser un outil en ligne (realfavicongenerator.net)
Option 2 : Creer un SVG scalable et le convertir

---

**Statut** : Pret pour implementation

Lancer l'implementation pour commencer.
