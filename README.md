# Conectrz

Creator discovery and communication platform for the Japanese market.
Companies discover, evaluate, save and contact creators living in Japan.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and ESLint.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/discover`.

Other scripts: `npm run lint`, `npm run build`, `npm start`.

## Where to change things

| What | Where |
| --- | --- |
| Colors, radii, shadows, gradient | `src/app/globals.css` (the `@theme` block) |
| Fonts (Urbanist + Inter) | `src/app/layout.tsx` |
| Header, nav, account menu | `src/components/layout/` |
| Nav items | `src/components/layout/navItems.ts` |
| Discovery page title/copy + layout | `src/app/(company)/discover/page.tsx` |
| Creator card | `src/components/discovery/CreatorCard.tsx` |
| Card image ratio / fallback | `src/components/discovery/CreatorImage.tsx` |
| Grid columns | `src/components/discovery/CreatorGrid.tsx` |
| Filter labels, primary vs "More filters", price/follower ranges, sort options | `src/lib/discovery/filterConfig.ts` |
| Filter UI | `src/components/discovery/Filter*.tsx`, `OptionButton.tsx` |
| Search / filter / sort logic | `src/lib/discovery/applyFilters.ts` |
| Product types | `src/types/` |
| **Mock data** | `src/mocks/` |
| Data access (swap mocks for Supabase here) | `src/lib/data/` |
| Icons | `src/components/ui/icons.tsx` |
| Logo placeholder | `src/components/ui/Logo.tsx` |

Design tokens are Tailwind utilities: `--color-primary` → `bg-primary`, `text-primary`;
`--radius-card` → `rounded-card`; `--font-display` → `font-display`. Use
`bg-brand-gradient` for the brand gradient (sparingly).

## Mock data

Creator Discovery currently uses local mock data (`src/mocks/`). Nothing is written
to Supabase. Pages read data only through `src/lib/data/*`, so connecting Supabase
means replacing those function bodies — components stay the same.

Creator photos are temporary Unsplash placeholders. Allowed image hosts are
listed in `next.config.ts` (`images.remotePatterns`).
