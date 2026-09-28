# Conectrz

Creator discovery and communication platform for the Japanese market.
Companies discover, evaluate, save and contact creators living in Japan.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, ESLint and Supabase.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 — it redirects to `/discover`.

Other scripts: `npm run lint`, `npm run build`, `npm start`.

### Mock mode vs Supabase mode

Set `NEXT_PUBLIC_DATA_SOURCE` in `.env.local` (restart `npm run dev` after changing it):

- `mock` (default): sample creators, conversations and a signed-in mock company.
  No login required; saving and sending messages work in memory until the server restarts.
- `supabase`: real data, real sign-in (`/login`, `/signup`), and pages require a
  company account. The database starts empty, so Discover shows no creators until
  creators exist in Supabase.

Only the public Supabase URL and publishable key are used. Never add the
service-role/secret key to this project.

## Screens

| Route | Screen |
| --- | --- |
| `/discover` | Creator Discovery |
| `/creators/[id]` | Creator Profile |
| `/saved` | Saved creators |
| `/messages`, `/messages/[id]` | Conversations (reply only — starting new conversations is disabled for now) |
| `/login`, `/signup` | Company sign-in / sign-up |

## Where to change things

| What | Where |
| --- | --- |
| Colors, radii, shadows, gradient | `src/app/globals.css` (the `@theme` block) |
| Fonts (Urbanist + Inter) | `src/app/layout.tsx` |
| Page width / side gutters | `src/components/layout/PageContainer.tsx` |
| Header, nav, account menu, mobile tab bar | `src/components/layout/` |
| Nav items | `src/components/layout/navItems.ts` |
| Buttons | `src/components/ui/buttonStyles.ts` |
| Form inputs | `src/components/ui/TextField.tsx` |
| Discovery page title/copy + layout | `src/app/(company)/discover/page.tsx` |
| Creator card / image ratio / grid | `src/components/discovery/CreatorCard.tsx`, `CreatorImage.tsx`, `CreatorGrid.tsx` |
| Filters (labels, primary vs "More filters", ranges, sort) | `src/lib/discovery/filterConfig.ts` |
| Creator Profile layout | `src/components/creator/CreatorProfileView.tsx` |
| Contact / Save buttons on the profile | `src/components/creator/ProfileActions.tsx` |
| Messages layout, list, thread, composer | `src/app/(company)/messages/`, `src/components/messages/` |
| Sign-in / sign-up layout and forms | `src/app/(auth)/layout.tsx`, `src/components/auth/` |
| Product types | `src/types/` |
| **Mock data** | `src/mocks/` |
| Data access (mock or Supabase) | `src/lib/data/` |
| Server actions (save, send, sign in/out) | `src/lib/actions/` |
| Icons / logo placeholder | `src/components/ui/icons.tsx`, `Logo.tsx` |

Design tokens are Tailwind utilities: `--color-primary` → `bg-primary`, `text-primary`;
`--radius-card` → `rounded-card`; `--font-display` → `font-display`. Use
`bg-brand-gradient` for the brand gradient (sparingly).

## Data and Supabase

Pages read data only through `src/lib/data/*`, which switches between `src/mocks/`
and Supabase. All Supabase queries run as the signed-in user, so Row Level Security
applies. Company ids always come from the session, never from the browser.

Database types live in `src/lib/supabase/database.types.ts` — regenerate them after
schema changes.

Sign-up: the `on_auth_user_created` database trigger creates the `profiles` row
(role `company` or `creator` only — never `admin`). The app then creates the
`company_profiles` row (`ensureCompanyProfile` in `src/lib/data/account.ts`).

If email confirmation is on in Supabase Auth, add
`http://localhost:3000/auth/confirm` (and your production URL) to
**Authentication → URL Configuration → Redirect URLs**.

Creator photos are temporary Unsplash placeholders in mock mode. Allowed image
hosts (Unsplash + this project's Supabase Storage) are in `next.config.ts`.
