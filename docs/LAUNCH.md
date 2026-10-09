# Launch checklist

Work through these in order. Each step says where to click.

---

## 1. Test with real Supabase on your computer

1. In `.env.local`, set:
   ```
   NEXT_PUBLIC_DATA_SOURCE=supabase
   ```
2. Restart the app: `npm run dev`, then open http://localhost:3000.
3. **Supabase dashboard → Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (change to your real domain after deploying)
   - Redirect URLs: add `http://localhost:3000/auth/confirm`
4. Walk through these, ideally in two different browsers (or one normal + one private window):

   | As | Check |
   | --- | --- |
   | Creator | `/signup/creator` → confirm email → onboarding → add photo, services, social accounts, portfolio → **Preview profile** |
   | Company | `/signup` → confirm email → **Discover** shows the creator → open profile → **Save** → **Contact creator** (uses the 1 free conversation) |
   | Creator | **Messages** shows the company's message → reply |
   | Company | Reply arrives; try **Contact** on a second creator → see the upgrade suggestion |
   | Either | **Forgot password?** on the sign-in page → email → set a new password |
   | Either | Report a profile or conversation |
5. Make yourself an admin (Supabase → SQL Editor):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Then open `/admin`: resolve the report, switch the company to **Starter**, check **Activity**.

If something fails, note the page and what you clicked — and check
**Supabase → Logs** (Postgres / Auth / Edge Functions).

> Supabase pauses free projects after about a week without use. If the app suddenly
> can't load data, open the dashboard and click **Restore**. A paid plan avoids this.

---

## 2. Email notifications (Resend)

New-message emails are already built (database trigger + `notify-new-message`
edge function). They start sending once these are set:

1. Create an account at https://resend.com.
2. **Resend → Domains → Add domain** → enter your domain → add the DNS records it
   shows at your domain registrar → wait until it says **Verified**.
3. **Resend → API Keys → Create** (permission: *Sending access*). Copy the key.
4. **Supabase → Edge Functions → Secrets** (Project Settings → Edge Functions), add:

   | Name | Value |
   | --- | --- |
   | `RESEND_API_KEY` | the key from step 3 |
   | `EMAIL_FROM` | `Conectrz <notifications@yourdomain.com>` |
   | `APP_URL` | `https://yourdomain.com` (no trailing slash; use `http://localhost:3000` while testing) |

5. Send a message between two test accounts — the recipient gets one email per
   conversation until they open it.

Also recommended: **Supabase → Authentication → Emails → SMTP Settings** → use
Resend's SMTP (host `smtp.resend.com`, port `465`, user `resend`, password = your API
key). Supabase's built-in sender is rate-limited and only meant for testing, so
sign-up and password-reset emails need this before launch.

The email design lives in `supabase/functions/notify-new-message/index.ts`. After
editing it, redeploy with the Supabase CLI: `supabase functions deploy notify-new-message --no-verify-jwt`.

---

## 3. Deploy (Vercel)

1. Go to https://vercel.com → **Add New → Project** → import `themoodees/conectrz`.
   Choose the branch you want to deploy (e.g. `main` after merging).
2. **Environment Variables** (copy from `.env.example`):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_DATA_SOURCE` | `supabase` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://kwjpvlxnuquphjblydcy.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the publishable key from `.env.example` |
   | `NEXT_PUBLIC_SUPPORT_EMAIL` | your support address |

   Never add the Supabase *service role* / secret key here.
3. **Deploy**. Then **Settings → Domains** → add your domain and follow the DNS steps.
4. Back in **Supabase → Authentication → URL Configuration**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: add `https://yourdomain.com/auth/confirm` (keep the localhost one for testing)
5. **⚠️ Don't forget:** change the `APP_URL` edge function secret from
   `http://localhost:3000` to `https://conectrz.com`
   (Supabase → Edge Functions → Secrets). Otherwise links in notification emails
   point to localhost.

---

## 4. Replace placeholders

| What | Where |
| --- | --- |
| Logo | `src/components/ui/Logo.tsx` (and `public/` for image files) |
| Browser tab icon | replace `src/app/favicon.ico` (or add `src/app/icon.png`) |
| Homepage text | `src/components/marketing/homeContent.ts` |
| Homepage photos | `src/app/page.tsx` (`photos` uses mock creator photos) |
| Support email | `NEXT_PUBLIC_SUPPORT_EMAIL` in `.env.local` and Vercel |
| Plan names, prices, limits | Admin → **Plans** (live in the database) |
| Niches, languages, services | Admin → **Categories** |
| Terms / Privacy / Legal notice | `src/content/legal/` — replace every `[placeholder]` with lawyer-reviewed text and set `lastUpdated` |

---

## 5. Before going public

- [ ] All checks in step 1 pass on the deployed site
- [ ] Emails arrive (sign-up confirmation, password reset, new message) and don't land in spam
- [ ] Legal pages finalised (the "Draft" banner disappears once `lastUpdated` is a real date)
- [ ] `APP_URL` secret changed to `https://conectrz.com`
- [ ] Supabase project on a plan that doesn't pause
- [ ] First creators invited, so Discover isn't empty
