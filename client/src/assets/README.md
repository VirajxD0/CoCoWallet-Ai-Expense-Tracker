# Assets — CocoWallet 🥥

Central location for static images & media used in the CocoWallet client.

```
src/assets/
├── images/        # app images, illustrations, logos, backgrounds
│   ├── logo.svg
│   ├── hero.png
│   └── empty-state.webp
├── icons/         # custom SVG icons (if not using lucide-react)
└── README.md
```

## Usage (Vite + ` @/` alias)

Vite handles image imports automatically — optimized + hashed at build.

```tsx
// Import via @/ alias (configured in vite.config.ts + tsconfig.json)
import logo from '@/assets/images/logo.svg'
import hero from '@/assets/images/hero.png'

export function Header() {
  return <img src={logo} alt="CocoWallet" className="h-8 w-auto" />
}

// Or in CSS / Tailwind
<div className="bg-[url('@/assets/images/hero.png')]" />
```

### Guidelines
- **Naming:** `kebab-case` — `dashboard-empty.svg`, `auth-background.webp`
- **Format:** prefer `webp` / `avif` for photos, `svg` for logos/icons
- **Size:** keep images < 300kB; run through [Squoosh](https://squoosh.app/) or `sharp` before committing
- **Public vs src/assets:** use `src/assets` for images imported in code (bundled + hashed). Use `public/` only for files referenced by absolute URL (`/og-image.png`, `/favicon.ico`)

### Adding a new image
1. Drop file into `src/assets/images/` (e.g. `onboarding-1.webp`)
2. Import in component: `import onboarding from '@/assets/images/onboarding-1.webp'`
3. Use: `<img src={onboarding} alt="..." />` — Vite will copy + fingerprint on `npm run build`
