# Conectrz

Creator discovery and communication platform for the Japanese market.
Companies discover, evaluate, save and contact creators living in Japan.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, ESLint and Supabase.

**Going live?** Follow [`docs/LAUNCH.md`](docs/LAUNCH.md) — testing, email, deployment and placeholders.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 for the homepage, or go straight to http://localhost:3000/discover.

Other scripts: `npm run lint`, `npm run format` (Prettier), `npm run build`, `npm start`.

### Mock mode vs Supabase mode

Set `NEXT_PUBLIC_DATA_SOURCE` in `.env.local` (restart `npm run dev` after changing it):

- `mock` (default): sample data and no login. The company area acts as a mock company,
  `/creator` acts as a mock creator (Yui Tanaka) and `/admin` as an admin. Changes are
  kept in memory until the server restarts. File uploads only work in Supabase mode.
- `supabase`: real data, real sign-in (`/login`, `/signup`), and pages require a
  company account. The database starts empty, so Discover shows no creators until
  creators exist in Supabase.

Only the public Supabase URL and publishable key are used. Never add the
service-role/secret key to this project.

## Screens

| Area | Routes |
| --- | --- |
| Public | `/` homepage, `/login`, `/signup` (company), `/signup/creator` |
| Company | `/discover`, `/creators/[id]`, `/saved`, `/messages`, `/plans`, `/settings` |
| Creator | `/creator/messages`, `/creator/profile` (editor + preview), `/creator/settings`, `/creator/onboarding` |
| Admin | `/admin/reports`, `/admin/accounts`, `/admin/categories`, `/admin/plans`, `/admin/activity` |

After signing in, `/home` sends each account type to its area.

## Where to change things

| What | Where |
| --- | --- |
| Colors, radii, shadows, gradient | `src/app/globals.css` (the `@theme` block) |
| Fonts (Urbanist + Inter) | `src/app/layout.tsx` |
| Page width / side gutters | `src/components/layout/PageContainer.tsx` |
| Header, account menu, mobile tab bar | `src/components/layout/` |
| Nav items + account menu links (all areas) | `src/components/layout/navItems.ts` |
| Homepage copy | `src/components/marketing/homeContent.ts` |
| Buttons | `src/components/ui/buttonStyles.ts` |
| Form inputs | `src/components/ui/TextField.tsx` |
| Discovery page title/copy + layout | `src/app/(company)/discover/page.tsx` |
| Creator card / image ratio / grid | `src/components/discovery/CreatorCard.tsx`, `CreatorImage.tsx`, `CreatorGrid.tsx` |
| Filters (labels, primary vs "More filters", ranges, sort) | `src/lib/discovery/filterConfig.ts` |
| Creator Profile layout | `src/components/creator/CreatorProfileView.tsx` |
| Contact / Save buttons on the profile | `src/components/creator/ProfileActions.tsx` |
| Messages (shared by companies and creators) | `src/components/messages/` |
| Contact dialog / plan usage | `src/components/creator/ContactCreator.tsx` |
| Creator profile editor | `src/components/creatorEditor/` |
| Admin panel | `src/app/admin/`, `src/components/admin/` |
| Modal, fields, form messages | `src/components/ui/` |
| Sign-in / sign-up layout and forms | `src/app/(auth)/layout.tsx`, `src/components/auth/` |
| Product types | `src/types/` |
| **Mock data** | `src/mocks/` |
| Data access (mock or Supabase) | `src/lib/data/` |
| Server actions (all writes) | `src/lib/actions/` |
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

### Database rules the app relies on

Added as migrations in this project (see Supabase → Database → Migrations):

- `create_profile_on_signup` — creates `profiles` for company/creator sign-ups (never admin).
- `creator_media_storage` — public `creator-photos` and `portfolio` buckets; creators can
  only upload to their own folder.
- `conversation_quota` — each new conversation counts against the plan's
  `conversation_quota` for the current subscription period; `start_conversation` creates
  the conversation and first message together; `my_conversation_usage` powers the UI.
- `free_plan_lifetime_allowance` — Free plans (¥0) are a one-time allowance: they count
  every conversation the company has ever started, so the count never resets.
- `notify_new_message` — when a message arrives, creates a notification for the other
  person (once per conversation until they read it) and calls the `notify-new-message`
  edge function (`supabase/functions/`), which emails it via Resend. Opening a
  conversation marks its notification read.
- `admin_manages_company_status` and `only_admins_change_account_status` — admins can
  pause/ban companies and creators; users can't change their own status.
- `seed_placeholder_plans_and_categories` — **placeholder** plans (Free/Starter/Pro) and
  starter niches, languages and services. Edit them in the admin panel.

Banned accounts use status `deleted` (the `account_status` enum has no "banned" value).

### Creating an admin

Admins can't sign up through the app. Sign up normally, then in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = 'you@example.com'
);
```

### Plans and billing

There is no payment integration yet. Companies request a plan by email (the address is
`NEXT_PUBLIC_SUPPORT_EMAIL`), and an admin switches their plan under Admin → Accounts →
Companies → Manage plan.
