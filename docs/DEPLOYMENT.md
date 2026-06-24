# Deployment

## Web (Vercel)

1. Import the repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `apps/web` (or use monorepo settings with `apps/web/vercel.json`).
3. Add environment variables from `apps/web/.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY` (optional)
4. Deploy. Production URL serves `/today` as the PWA entry via `manifest.json`.

### Local production build

```bash
pnpm install
pnpm --filter @neurodivergent-flow/web build
pnpm --filter @neurodivergent-flow/web start
```

## Supabase production

1. Create a production Supabase project (separate from dev).
2. Run SQL from `docs/SUPABASE_SETUP.md`.
3. Enable RLS policies as documented.
4. Point Vercel env vars at the production project.

## Mobile (EAS) — post-MVP

```bash
cd apps/mobile
eas build --platform all
```

Requires Expo account and `eas.json` configuration (not yet in repo).

## PWA icons

Replace placeholder icons in `apps/web/public/`:

- `icon-192.png`
- `icon-512.png`

Until custom icons exist, the manifest references these paths; add simple branded PNGs before production launch.

## Stage 7 checklist

- [ ] Vercel deploy succeeds
- [ ] Supabase production schema + RLS
- [ ] Browser notifications permission flow on `/settings`
- [ ] High contrast + reduced motion toggles
- [ ] Analytics opt-in (no events without toggle)
- [ ] Smoke test: onboarding → today → runner → week
