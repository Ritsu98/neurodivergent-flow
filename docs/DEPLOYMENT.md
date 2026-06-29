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

## Mobile (EAS)

Internal test builds use the **`preview`** profile (Android APK + iOS internal distribution).

### Prerequisites

- [Expo account](https://expo.dev/signup)
- [EAS CLI](https://docs.expo.dev/build/setup/) (`pnpm --filter @neurodivergent-flow/mobile exec eas --version`)
- Apple Developer account (iOS internal/ad hoc) and Google Play Console optional for APK sideload
- Supabase project with schema from `docs/SUPABASE_SETUP.md`

### One-time setup

```bash
cd apps/mobile

# Link project to Expo (creates projectId in Expo dashboard)
pnpm exec eas login
pnpm exec eas init

# Copy env template and fill Supabase keys
cp .env.example .env
```

After `eas init`, add the project ID to `app.config.ts` `extra.eas.projectId` or set `EAS_PROJECT_ID` in EAS secrets.

### EAS secrets (recommended)

Set secrets in Expo dashboard or CLI — do not commit keys:

```bash
cd apps/mobile
pnpm exec eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
pnpm exec eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

These are injected at build time for `preview` / `production` profiles.

### Local dev (no EAS)

```bash
pnpm --filter @neurodivergent-flow/mobile dev
```

Scan QR with Expo Go, or press `a` / `i` for emulator.

### Internal preview build

```bash
cd apps/mobile
pnpm run build:preview:android   # APK for sideload
pnpm run build:preview:ios       # requires Apple credentials
# or both:
pnpm run build:preview
```

Download artifacts from the [Expo dashboard](https://expo.dev) when the build completes.

### QA

Run `docs/MOBILE_QA.md` on physical devices before sharing builds.

### Profiles (`eas.json`)

| Profile | Use |
|---------|-----|
| `development` | Internal channel; dev Supabase via env |
| `preview` | **Default internal QA** — Android APK, iOS internal |
| `production` | Store-ready (auto-increment version) |

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
- [ ] Mobile EAS preview build installs on Android + iOS device
- [ ] Mobile QA checklist (`docs/MOBILE_QA.md`) spot-checked
