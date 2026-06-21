# MatchFrame — Run & Deploy

This document is the full recipe for getting MatchFrame running locally and shipping it to production.

The product is a Next.js 14 (App Router) app backed by Supabase, Stripe, OpenAI Vision, and Resend.

---

## 1. What you need

| Service | What it does | Sign-up |
|---|---|---|
| **Supabase** | Auth, Postgres, file storage | https://supabase.com |
| **Stripe** | Payments | https://stripe.com |
| **OpenAI** | Vision-model photo analysis | https://platform.openai.com |
| **Resend** | Transactional email | https://resend.com |
| **Vercel** | Hosting | https://vercel.com |

Local toolchain: Node **20+**, **npm** (or pnpm/yarn — examples below use npm), `git`. Optional but recommended: the Supabase CLI (`brew install supabase/tap/supabase`) and Stripe CLI (`brew install stripe/stripe-cli/stripe`) for local development.

---

## 2. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill it in (see §3 for what each var means)
cp .env.example .env.local

# 3. Run the dev server
npm run dev

# App is now at http://localhost:3000
```

If you don't yet have the cloud accounts ready, sections §3–§5 explain how to provision each one.

---

## 3. Environment variables

Open `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → **publishable** (starts with `sb_publishable_…`). Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted. |
| `SUPABASE_SECRET_KEY` | Project Settings → API Keys → **secret** (starts with `sb_secret_…`). **Server-side only — never expose to the browser.** Legacy `SUPABASE_SERVICE_ROLE_KEY` is also accepted. |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys → secret (use `sk_test_...` while testing) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` (local) or the webhook endpoint screen (prod) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same Stripe API-keys screen → publishable key |
| `STRIPE_PRICE_ID` | The `price_…` id of the product representing one photo test. Create it in Stripe → Products → Add product (set name, amount, currency) and copy the price id. Amount and currency are read live from Stripe — no need to mirror them here. |
| `OPENAI_API_KEY` | OpenAI dashboard → API keys |
| `OPENAI_VISION_MODEL` | `gpt-4o` (default) or another vision-capable model |
| `RESEND_API_KEY` | Resend dashboard → API keys |
| `RESEND_FROM_EMAIL` | A verified sender, e.g. `MatchFrame <hello@matchframe.app>` |
| `NEXT_PUBLIC_APP_URL` | Full URL of the app: `http://localhost:3000` locally, your prod URL in Vercel |
| `CRON_SECRET` | Any long random string. Used to authenticate the AI-processing cron route |

A quick way to generate `CRON_SECRET`:

```bash
openssl rand -hex 32
```

---

## 4. Supabase — database, storage, auth

### 4.1 Run the migrations

The schema lives in `supabase/migrations/`. Apply both files in order:

**Easy path (SQL editor):** open Supabase dashboard → SQL Editor → New query → paste the contents of `0001_init.sql`, run. Repeat for `0002_storage.sql`.

**CLI path:**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

What the migrations create:
- `profiles` mirrored from `auth.users` (auto-populated on signup).
- `photo_tests`, `photos`, `payment_history`, `voters`, `votes`, `photo_reports`, `photo_test_reports`, `next_steps`.
- Row Level Security so users can only see their own data.
- A private storage bucket `photos` with policies that only let a user read/write files under their own UID folder.

### 4.2 Auth providers

In Supabase dashboard → Authentication → Providers:

- **Email / password**: enabled by default. Toggle "Confirm email" off for development if you want frictionless signups.
- **Google OAuth** (optional but recommended): enable, paste the Google OAuth client ID/secret. Set the redirect URL to `${NEXT_PUBLIC_APP_URL}/auth/callback`. You also need that callback whitelisted under "Authentication → URL Configuration → Redirect URLs". Add both `http://localhost:3000/auth/callback` and your prod URL.

### 4.3 Storage

The `photos` bucket is created by the migration. **Keep it private.** The app generates signed URLs on demand (`lib/storage.ts`). You do not need to touch the bucket manually unless you want to look at uploaded files.

---

## 5. Stripe — payments

1. Create a Stripe account, switch to **Test mode** for development.
2. Copy `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` into `.env.local`.

### 5.1 Webhooks locally

In a separate terminal:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a webhook signing secret like `whsec_...`. Copy it into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.

### 5.2 Webhooks in production

In Stripe dashboard → Developers → Webhooks → **Add endpoint**:
- URL: `https://your-domain.com/api/stripe/webhook`
- Events to send: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`.
- Copy the **Signing secret** (`whsec_…`) into `STRIPE_WEBHOOK_SECRET` in Vercel.

### 5.3 Price

Create one Product in Stripe (e.g. "MatchFrame photo test") with a one-time Price in any currency, copy the resulting `price_…` id into `STRIPE_PRICE_ID`. The app reads the amount and currency live from Stripe — change them in the Stripe dashboard and the payment page picks up the new values within 5 minutes (the resolved Price is cached server-side that long).

---

## 6. OpenAI — Vision

1. Create an API key in https://platform.openai.com/api-keys.
2. Put it in `OPENAI_API_KEY`.
3. (Optional) Change `OPENAI_VISION_MODEL` if you want to use a different model. Default is `gpt-4o`.

Cost notes for the first version:
- Step 1 (per-photo evaluation): 1 vision request per test.
- Step 2 (100 voters): 5 batches of 20 personas — 5 vision requests per test.
- Step 4 (final report text): 1 text request per test.

Total: ~7 API calls per photo test. Each call sends low-detail thumbnails (`detail: "low"`) to keep tokens down.

---

## 7. Resend — email

1. Verify a sending domain in https://resend.com (or use the `onboarding@resend.dev` sandbox sender while developing).
2. Put your API key in `RESEND_API_KEY` and a verified sender in `RESEND_FROM_EMAIL`.

The app sends one transactional email per completed photo test (and on-demand resends when the user hits "Email me this report" on the report page).

---

## 8. Background processing

The AI pipeline runs in `/api/cron/process`. There are two ways it gets triggered:

1. **Immediately after payment** — the Stripe webhook calls `/api/cron/process` with `{ testId }`. This works on Vercel; runtime is up to 5 minutes (`maxDuration = 300`).
2. **Recurring fallback** — `vercel.json` registers a cron entry that hits `/api/cron/process` every 5 minutes and drains any test left in the `queued` state.

Auth: the route accepts the secret as `Authorization: Bearer <CRON_SECRET>`, an `x-cron-secret` header, or `?secret=...` query. **Vercel cron sends `Authorization: Bearer ${CRON_SECRET}` automatically** when `CRON_SECRET` is set as an env var.

You can also kick off a run manually:

```bash
curl -X POST https://your-domain.com/api/cron/process \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "content-type: application/json" \
  -d '{}'
```

---

## 9. Deploying to Vercel

```bash
# Once
npm i -g vercel
vercel login

# In the project root
vercel link        # connect to a Vercel project (create one when prompted)
```

Then in the Vercel dashboard → Settings → Environment Variables, add every value from `.env.local` for **Production**, **Preview**, and (optionally) **Development**. The `NEXT_PUBLIC_*` ones are public; the rest are server-only.

Deploy:

```bash
vercel --prod
```

After the first prod deploy:

1. Copy your prod URL into `NEXT_PUBLIC_APP_URL` and redeploy.
2. Add the prod URL (and `/auth/callback`) to Supabase → Authentication → URL Configuration → Redirect URLs.
3. Update Stripe → Webhooks endpoint to the prod URL and paste the new signing secret into `STRIPE_WEBHOOK_SECRET`.
4. (If using Google OAuth) add the prod URL to your Google Cloud OAuth client's redirect URIs.

### About Supabase hosting

Supabase itself is fully managed — no deploy step. Just make sure you've run the migrations against the production project and that the production storage bucket has the policies from `0002_storage.sql`.

---

## 10. Smoke test in production

1. Visit `https://your-domain.com` — landing page loads, theme toggle works, "See a sample report" renders.
2. Sign up with a new email. (If you required email confirmation in Supabase, click the confirmation link.)
3. Upload 2–10 photos on `/upload`, pick an audience, continue.
4. Pay with the Stripe test card `4242 4242 4242 4242` (any future date, any CVC). You should land on `/submitted/<id>`.
5. Wait for the webhook to flip the test to `queued`, then the cron (or webhook trigger) to flip it to `processing` and finally `completed`.
6. You should receive the "Your MatchFrame report is ready" email.
7. The dashboard shows the test as **Completed**; clicking it opens the full report at `/report/<id>`.

---

## 11. Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Could not start checkout" | `STRIPE_SECRET_KEY` missing or wrong, or you're in live mode with test keys (or vice-versa). |
| Webhook signature errors | `STRIPE_WEBHOOK_SECRET` doesn't match the endpoint you're calling. In dev it must match the secret printed by `stripe listen`. |
| Tests stuck in `queued` forever | Cron isn't running. Check Vercel → Cron, or hit `/api/cron/process` manually with the `Authorization: Bearer` header. |
| Tests stuck in `processing` | OpenAI request timed out or errored. Check the function logs in Vercel; the route catches errors and flips the test to `failed`. |
| Photos won't display in the report | Signed-URL TTL expired (1 hour). Refresh the page; URLs are minted server-side per request. |
| "RLS violation" errors in webhooks | The webhook must use the service-role client (`createAdminClient`), not the user-scoped one. This is wired correctly in `app/api/stripe/webhook/route.ts`. |

---

## 12. Project map

```
app/
  page.tsx                       Landing
  (auth)/signin                  Sign in
  (auth)/signup                  Sign up
  auth/callback                  OAuth + email-confirm exchange
  dashboard                      List of photo tests
  upload                         New photo test (upload + audience picker)
  payment/[id]                   Order summary + Stripe Checkout button
  submitted/[id]                 Post-payment confirmation page
  report/[id]                    Full analysis report
  report/sample                  Public sample for landing-page link
  account                        Profile + payments + delete
  api/
    photo-tests/                 Creates the PhotoTest + Photo rows
    checkout/                    Creates a Stripe Checkout session
    stripe/webhook/              Stripe webhook handler
    cron/process/                The AI pipeline runner (cron + webhook-triggered)
    reports/[id]/email/          Re-send the report by email
    account/                     DELETE = wipe user data
components/                      Shared UI (header, photo frame, report view, etc.)
lib/
  supabase/{client,server,admin} Three Supabase clients
  stripe.ts                      Stripe singleton
  openai.ts                      OpenAI singleton
  ai-analysis.ts                 4-step pipeline (analyse → vote → rank → write)
  voter-personas.ts              100 lightweight female personas
  storage.ts                     Signed-URL helpers
  resend.ts + email-templates.ts Email
supabase/migrations/             SQL schema + storage policies
middleware.ts                    Redirect unauthed → /signin; redirect signed-in → /dashboard
```

That's the whole picture. Welcome to MatchFrame.
