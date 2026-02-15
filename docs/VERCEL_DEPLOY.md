Vercel deploy checklist — ensure Next.js is used and envs are set

This document shows the exact steps to remove a Vite Production Override in Vercel, and the exact environment variables the project expects in production. Do NOT commit secrets to the repository.

1. Remove the Vite Production Override (Vercel UI)

- Go to your Project → Settings → Build & Development.
- At the top, if you see a yellow "Production Overrides" banner, click the blue link shown in the banner. This opens the specific deployment that created the override.
- On that deployment page, click the right-hand Settings panel.
- For each field that shows "Override" (Framework, Install / Build / Dev Commands, Output Directory), set it to "Use Project Settings" or click "Remove override".
  - For Framework, choose "Use Project Settings" and ensure the Project's framework preset is Next.js.
- Return to Project → Settings → Build & Development and confirm the yellow banner is gone.

2. Confirm Project Settings for Next.js

- Framework Preset: Next.js
- Root Directory: (empty) — unless you intentionally deploy a subfolder
- Build Command / Install Command / Output Directory / Dev Command: leave empty (let Vercel auto-detect)
- Node.js Version: 20.x (recommended)
- Click Save if available.

3. Required environment variables (set these in Vercel → Project → Settings → Environment Variables)

Minimum required for production runtime (do not commit these values):

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (public)
- CLERK_SECRET_KEY (server)
- NEXT_PUBLIC_CLERK_SIGN_IN_URL (e.g. /sign-in)
- NEXT_PUBLIC_CLERK_SIGN_UP_URL (e.g. /sign-up)

- NEXT_PUBLIC_SUPABASE_URL (public)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (public)
- SUPABASE_SERVICE_ROLE_KEY (server)

- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (public)
- STRIPE_SECRET_KEY (server)
- STRIPE_WEBHOOK_SECRET (server)

- NEXT_PUBLIC_APP_URL (e.g. https://your-site.vercel.app)

Optional / feature flags / prices used by the app (add if relevant):

- NEXT_PUBLIC_PRICE_SOLO
- NEXT_PUBLIC_PRICE_PRO
- NEXT_PUBLIC_PRICE_BUSINESS
- NEXT_PUBLIC_PRICE_ENTERPRISE
- NEXT_PUBLIC_MAPBOX_TOKEN
- NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID
- NEXT_PUBLIC_STATUS_ENABLED
- Any other NEXT*PUBLIC*\* keys you see in `.env.example` or `.env.local`.

4. Local validation - commands to run locally (from repo root)

Install dependencies (pnpm preferred):

```bash
pnpm install
# or: npm install
```

Start dev server (should use Next):

```bash
pnpm dev
# or: npm run dev
```

If `next` isn't recognized for any reason, you can run the binary directly:

```bash
npx next dev
```

Build locally to reproduce Vercel build step:

```bash
pnpm build
# or: npm run build
```

5. Notes about Vite files and detection

- This repository includes a `vite.config.ts` and multiple `VITE_*` environment references. Vercel's auto-detection may pick Vite if it sees a `vite.config` file or `vite` in `devDependencies`.
- Recommended approach (non-destructive): remove the Production Override via the Vercel UI (steps above). That tells Vercel to use "Next.js" for new deployments.
- If you want to _force_ Vercel to use Next without touching the Vercel UI, you can add a conservative `vercel.json` (see below). However, Vercel's Project Settings (UI) are authoritative for Framework Preset and still may show the Production Override until removed.

Optional `vercel.json` (example)

```json
{
  "version": 3,
  "builds": [{ "src": "package.json", "use": "@vercel/next" }]
}
```

This `vercel.json` is conservative and simply makes the Next.js build explicit; it does not remove UI overrides.

6. After deploy: verify

- Visit your Vercel deployment URL and check critical pages:
  - `/sign-in` should return 200 and render Clerk sign-in
  - `/pro` (or a protected route) should redirect to `/sign-in` if unauthenticated
  - API routes (webhooks, checkout) should respond with 200/expected statuses when called with proper secrets.

7. Security

- Never commit `.env.local` or `env.production` to the repo if they contain secrets. Use Vercel Environment Variables.
- Make sure server-only keys (CLERK*SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) are NOT prefixed with NEXT_PUBLIC* or VITE\_.

---

If you'd like, I can:

- Add the optional `vercel.json` to the repo now.
- Or create a small `scripts/vercel-setup.sh` that prints the recommended Vercel env names for quick copy-paste.

Tell me which and I'll add it.
