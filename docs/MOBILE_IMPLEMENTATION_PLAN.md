# Mobile App Implementation Plan

Plan to bring `apps/mobile` to **feature parity with the web MVP** (Stages 2–7).  
Aligned with `AGENTS.md`, `PRODUCT_SPEC.md`, and existing `packages/core` + `packages/api`.

**Last updated:** 2026-06-24  
**Prerequisite:** Web MVP complete (reference implementation)  
**Estimated total:** 6–8 weeks (one developer, part-time buffer)

---

## Goals

1. **Parity:** Same core loop as web — onboarding → today → runners → week → Sunday setup → settings.
2. **Local-first:** SQLite primary read path; Supabase sync when online (Stage M6).
3. **Shared logic:** Reuse `packages/core` (types, week generation, runner prefs, notifications policy). Reuse `packages/api` mutations where possible.
4. **Platform-native UX:** NativeWind + small component library; Expo Notifications; haptics where appropriate.
5. **Shippable:** EAS internal test build (iOS + Android).

## Non-goals (this plan)

- Features web does not have (meals library, nutrition, AI, social).
- Mobile-only features without web parity (`AGENTS.md` out of scope).
- Full conflict-resolution UI (match web Stage 6 partial — foundation only).
- App Store / Play Store public release (internal EAS build only).

---

## Current state

| Area | Status |
|------|--------|
| `apps/mobile` | Expo Router `app/` routes, NativeWind, UI primitives, tab shell |
| `package.json` | `expo-router/entry`, peer deps resolved |
| `app.config.ts` | Replaces `app.json`; no missing asset refs |
| NativeWind | `babel.config.js` configured; no `global.css` / entry wiring verified |
| SQLite | `expo-sqlite` dependency; not implemented |
| Auth | Not implemented (same gap as web — `temp-user-id`) |
| Shared packages | `@neurodivergent-flow/core`, `@neurodivergent-flow/api` in deps |

**Web reference map:**

| Web route | Mobile target |
|-----------|---------------|
| `/onboarding` | `app/onboarding/` |
| `/today` | `app/(tabs)/today` or `app/today` |
| `/week` | `app/(tabs)/week` |
| `/sunday-setup` | `app/sunday-setup` |
| `/settings` | `app/settings` |
| `/runner/focus` | `app/runner/focus` |
| `/runner/recharge` | `app/runner/recharge` |
| `/runner/flex` | `app/runner/flex` |
| `/runner/admin` | `app/runner/admin` |

---

## Architecture

```
apps/mobile/
├── app/                    # Expo Router (file-based)
│   ├── _layout.tsx         # Root: providers, fonts, theme
│   ├── index.tsx           # Redirect → onboarding or today
│   ├── onboarding/
│   ├── (tabs)/             # Today + Week bottom tabs
│   ├── sunday-setup/
│   ├── settings/
│   └── runner/
├── src/
│   ├── components/         # NativeWind UI primitives + feature components
│   ├── hooks/              # useCountdownTimer, useLocalDb, etc.
│   ├── lib/
│   │   ├── sqlite/         # Schema, migrations, repository layer
│   │   ├── sync/           # Queue + Supabase flush
│   │   └── notifications/  # Expo scheduling
│   └── providers/          # Auth, UserPrefs, QueryClient
└── assets/                 # icon, splash, notification icon
```

### Reuse strategy

| Layer | Reuse | Mobile-specific |
|-------|--------|-----------------|
| Types, Zod, business logic | `packages/core` 100% | — |
| Supabase mutations | `packages/api` | Env via `expo-constants` / `app.config` |
| UI | **Do not share** web components | NativeWind `Button`, `Card`, `Text`, `Slider`, `Stack` |
| Timer / runner flow | Port logic from web hooks | `AppState` + background timestamp (not `sessionStorage`) |
| Offline | — | SQLite + sync queue |

### Navigation model

- **Tabs:** Today, Week (matches web `AppNav` primary destinations).
- **Stack modals / full-screen:** Runners, Sunday Setup, Settings, Onboarding.
- **Deep links:** `neurodivergentflow://runner/focus` for notification actions (Stage M7).

---

## Mobile stages (M0–M7)

Dependency chain:

```
M0 Foundation
  ↓
M1 Onboarding
  ↓
M2 Today + Energy
  ↓
M3 Runners (Focus → Recharge → Flex → Admin)
  ↓
M4 Week + Sunday + Inbox
  ↓
M5 Settings + A11y + Notifications
  ↓
M6 SQLite + Sync
  ↓
M7 EAS build + QA
```

---

## M0: Mobile foundation (3–5 days)

**Goal:** Runnable Expo app with routing, design tokens, auth stub, dev workflow.

### Tasks

- [x] Fix Expo Router setup: `app/_layout.tsx`, `app/index.tsx`; remove or repoint legacy `src/app.tsx`.
- [x] Add missing `assets/` (icon, splash, adaptive-icon, notification-icon) or update `app.json`.
- [x] Wire NativeWind v4: `global.css`, `metro.config.js`, verify shared `tailwind.config.ts` tokens render.
- [x] Create `src/components/ui/`: `Button`, `Card`, `Text`, `Stack`, `Slider` (min 44×44 tap targets per `AGENTS.md`).
- [x] Configure Supabase env: `app.config.ts` + `.env` / `EXPO_PUBLIC_*` vars.
- [x] **Auth (minimal):** Supabase Auth email/password screens OR dev-mode `temp-user-id` with documented seed (match web until full auth).
- [x] Root providers: `QueryClientProvider`, `UserPrefsProvider` (port pattern from web).
- [x] Tab shell with placeholder screens.

### Deliverables

- `pnpm --filter @neurodivergent-flow/mobile dev` opens app on simulator/device.
- Navigation between placeholder Today / Week / Settings works.

### Risks

- `package.json` lists `expo-router` but `main` may need `expo-router/entry` — verify Expo 51 + Router 3 docs.
- Peer dependency warnings (RN 0.74 vs reanimated) — resolve before M3 timers.

---

## M1: Onboarding (4–5 days)

**Goal:** Port web 5-step onboarding; save prefs + first week plan.

### Tasks

- [x] Port steps from `apps/web/src/components/onboarding/*`:
  - Work window, Sleep, Intensity, Recharge, Supplements (optional).
- [x] Use `@neurodivergent-flow/core` `generateWeekPlan`.
- [x] Call `upsertUserPrefs`, `createWeekPlan` from `@neurodivergent-flow/api`.
- [x] Persist `onboardingComplete` flag (SQLite or Supabase user metadata).
- [x] Redirect to Today on completion.
- [x] Skip onboarding if already complete.

### Parity gaps to accept initially

- Supplements step may remain placeholder until supplement API exists (same as web Sunday step 4).

### Testing

- [ ] Complete onboarding end-to-end on Android + iOS simulator.
- [ ] Week plan row created in Supabase.

---

## M2: Today screen + energy (5–7 days)

**Goal:** Core daily hub — match web Stage 3.

### Tasks

- [x] Port `EnergySlider` (0–5, Green/Yellow/Red, `upsertEnergyLog`).
- [x] `PrimaryBlockCard` + `getRunnerPath` navigation.
- [x] `Top3Tasks` — list, complete; **defer add/edit modals** if needed (match web stubs).
- [x] `MvdCard` + Red day filter (`isMvdEssential`).
- [x] `EveningBlockCard` for work-window users.
- [x] Load `WeekPlan`, `getTasks`, `getEnergyLog` for today.
- [x] Sunday banner → navigate to Sunday Setup (optional component in header).

### Testing

- [ ] Energy persists to `energy_logs`.
- [ ] Red day shows MVD card and filters Top 3.
- [ ] Start button navigates to correct runner route by theme.

---

## M3: All runners (6–8 days)

**Goal:** Port web Stage 4 + 6 runners.

### Order (incremental)

1. **Focus** — ritual, dual timer + break, Later capture, hard stop (reference `FocusRunnerContent.tsx`).
2. **Recharge** — type select, ritual, optional timer, return ramp → Flex 5 min.
3. **Flex** — zones, checklist, sprint timer, next step.
4. **Admin** — categories, checklist, sprint timer, next step.

### Shared mobile work

- [x] `useCountdownTimer` — use `AppState` + persisted end timestamp (AsyncStorage or SQLite), not `sessionStorage`.
- [x] `SprintTimer`, `SprintChecklist`, `NextStepCapture` (port from `apps/web/src/components/runner/shared/`).
- [x] `createInboxItem` for Later capture.
- [ ] Haptic feedback on timer complete (`expo-haptics`) — respect `hapticsEnabled` pref.

### Testing

- [ ] Full Focus session on device with app backgrounded mid-timer.
- [ ] Later capture writes to `inbox_items`.
- [ ] Recharge return ramp opens Flex with `duration=5`.

---

## M4: Week + Sunday + Inbox (5–7 days)

**Goal:** Port web Stage 5.

### Tasks

- [ ] `WeekGlance` — 7 chips, work-window band, today highlight.
- [ ] `DayDetailView` — theme, tasks, swap/convert/time shift.
- [ ] `WeekPlanEditor` — adjacent day swap.
- [ ] `InboxPanel` — promote, soft-delete, limits (15 warn / 20 max).
- [ ] `TaskBoard` — This Week / Today / Done columns.
- [ ] `SundaySetup` — 4 steps, `getSundaySetupStartDate`.
- [ ] Tab or stack: Week screen with sub-tabs (Week / Later / Tasks) like web.

### Testing

- [ ] Reorder day themes persists to `week_plans`.
- [ ] Inbox promote creates task.

---

## M5: Settings + accessibility + notifications (4–6 days)

**Goal:** Port web Stage 7 mobile-specific pieces.

### Tasks

- [ ] Settings screen: high contrast, reduced motion, notification toggles, analytics opt-in.
- [ ] Apply `high-contrast` / `reduced-motion` via NativeWind + context (port `UserPrefsProvider` behavior).
- [ ] **Expo Notifications:**
  - Request permissions.
  - Schedule downshift + Primary Block reminders (`packages/core` `notifications.ts` policy).
  - Red day suppression + max 2/day.
  - Optional: notification categories with actions (“Start Focus”) — deep link to runner.
- [ ] Analytics opt-in (same PostHog fetch approach as web, or defer).
- [ ] VoiceOver / TalkBack: `accessibilityLabel` on sliders, buttons, tab bar.

### Testing

- [ ] Notification fires at scheduled time on physical device (simulator limitations documented).
- [ ] Red day suppresses non-essential notifications.

---

## M6: SQLite + sync (6–8 days)

**Goal:** Local-first reads; background sync — close web Stage 6 gap on mobile.

### Tasks

- [ ] Define SQLite schema mirroring Supabase tables used by MVP:
  - `user_prefs`, `week_plans`, `tasks`, `energy_logs`, `inbox_items`
- [ ] Repository layer: read local first, write local + enqueue sync.
- [ ] Port/enhance offline queue pattern from `apps/web/src/lib/offlineQueue.ts` for mobile.
- [ ] TanStack Query hooks with `initialData` from SQLite.
- [ ] Flush queue on `NetInfo` online + app foreground.
- [ ] LWW conflict: `updatedAt` comparison (same rules as `PRODUCT_SPEC.md` §9).

### Deliverables

- App usable offline for Today read + energy write (queued).
- Sync on reconnect without data loss for append-only logs.

### Risks

- Largest technical stage; consider shipping M1–M5 with direct Supabase first, then M6 as hardening (see phasing below).

---

## M7: EAS build + QA (3–5 days)

**Goal:** Installable internal test builds.

### Tasks

- [ ] Add `eas.json` (development, preview profiles).
- [ ] Configure EAS secrets for Supabase env.
- [ ] `eas build --platform all` (preview).
- [ ] Device QA matrix: 1 iOS + 1 Android physical device.
- [ ] Run manual checklist (copy from `BUILD_PROGRESS.md` Stages 3–7, mobile-specific).
- [ ] Document known issues in `BUILD_PROGRESS.md`.

### Deliverables

- Internal test APK/IPA (or TestFlight / Play internal track).
- `docs/DEPLOYMENT.md` updated with mobile section.

---

## Recommended phasing

### Phase A — “Works online” (fastest path to test on phone)

**M0 → M1 → M2 → M3 → M4 → M5 → M7** (skip M6 initially)

- Direct Supabase calls like web today.
- Good for: validating UX on device with real backend.
- **~4–5 weeks**

### Phase B — “Local-first” (original vision)

**Add M6** before or after M7

- Required for offline commute / spotty connectivity.
- **+1–2 weeks**

### Phase C — Auth hardening

Can run in parallel with M1 or after M2:

- Supabase Auth screens, session in SecureStore, replace `temp-user-id`.
- Unblocks production RLS properly.

---

## Component porting checklist (web → mobile)

| Web component | Mobile target | Notes |
|---------------|---------------|-------|
| `EnergySlider` | `src/components/today/EnergySlider.tsx` | Use RN `Slider` or custom |
| `PrimaryBlockCard` | `src/components/today/PrimaryBlockCard.tsx` | `Pressable` |
| `Top3Tasks` | `src/components/today/Top3Tasks.tsx` | `FlatList` |
| `MvdCard` | `src/components/today/MvdCard.tsx` | |
| `EveningBlockCard` | `src/components/today/EveningBlockCard.tsx` | |
| `WeekGlance` | `src/components/week/WeekGlance.tsx` | `Pressable` grid |
| `RitualChecklist` | Reuse in `src/components/runner/` | `Checkbox` |
| `useCountdownTimer` | `src/hooks/useCountdownTimer.ts` | AsyncStorage + AppState |

---

## Environment & dev commands

```bash
# Install (from repo root)
pnpm install

# Mobile env — apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Start
pnpm --filter @neurodivergent-flow/mobile dev

# Android / iOS
pnpm --filter @neurodivergent-flow/mobile android
pnpm --filter @neurodivergent-flow/mobile ios
```

---

## Success criteria (mobile MVP done)

- [ ] New user completes onboarding on device.
- [ ] Today screen: energy, Primary Block, Top 3, Red day MVD.
- [ ] All four runners complete a session.
- [ ] Week view + inbox promote/delete + Sunday Setup saves plan.
- [ ] Settings: a11y toggles + at least one scheduled local notification.
- [ ] EAS preview build installs on iOS and Android.
- [ ] (Phase B) Core flows work offline with sync on reconnect.

---

## Tracking

When starting mobile work, update:

1. `docs/BUILD_PROGRESS.md` — add **Mobile stages M0–M7** table.
2. `PRODUCT_SPEC.md` — check off mobile-specific Stage 1 items as completed.
3. This file — mark stages `[x]` as shipped.

---

## Related docs

- [`BUILD_PROGRESS.md`](BUILD_PROGRESS.md) — web implementation status
- [`WEB_APP.md`](WEB_APP.md) — web routes reference for porting
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — EAS section (to expand in M7)
- [`AGENTS.md`](../AGENTS.md) — NativeWind constraints, product principles
- [`PRODUCT_SPEC.md`](../PRODUCT_SPEC.md) — full feature requirements
