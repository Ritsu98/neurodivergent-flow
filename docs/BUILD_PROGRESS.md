# Build Progress

Living record of MVP implementation status. Aligned with the stage plan in `PRODUCT_SPEC.md`.

**Last updated:** 2026-06-04  
**Current focus:** MVP web complete — Stage 8 buffer / mobile optional  
**Primary platform:** Web (`apps/web`) — mobile scaffold exists, features not ported yet

---

## Stage summary

| Stage | Name | Status | Platform |
|-------|------|--------|----------|
| 1 | Foundation & Infrastructure | Partial | Web + monorepo |
| 2 | Onboarding Flow | Done (web) | Web |
| 3 | Today Screen + Energy Logging | Done (web) | Web |
| 4 | Focus Runner | Done (web) | Web |
| 5 | Weekly View + Sunday Setup + Inbox | Done (web) | Web |
| 6 | All Runners + Sync | Partial (web) | Web — runners done; sync foundation |
| 7 | Polish + Deploy | Done (web) | Web |

---

## Web routes (implemented)

| Route | Purpose |
|-------|---------|
| `/` | Landing placeholder |
| `/onboarding` | 5-step onboarding wizard |
| `/today` | Today screen (energy, Primary Block, Top 3, MVD, evening block) |
| `/runner/focus` | Focus Runner |
| `/runner/recharge` | Recharge Runner |
| `/runner/flex` | Flex Sprint |
| `/runner/admin` | Admin Sprint |
| `/week` | Weekly rhythm, Later inbox, task board |
| `/settings` | Accessibility, notifications, analytics opt-in |

---

## API mutations (`packages/api`)

| Module | Functions | Used by |
|--------|-----------|---------|
| `userPrefs` | `getUserPrefs`, `upsertUserPrefs` | Onboarding, Today, Focus Runner |
| `weekPlan` | `getWeekPlan`, `createWeekPlan`, `updateWeekPlan` | Onboarding, Today, Week, Sunday Setup |
| `energyLog` | `getEnergyLog`, `upsertEnergyLog`, `getEnergyLogsForDate` | Today |
| `tasks` | `createTask`, `getTasks`, `updateTask` | Today, Focus Runner, Week |
| `inbox` | `createInboxItem`, `getInboxItems`, `softDeleteInboxItem`, `markInboxItemPromoted` | Focus Runner, Week |

TanStack Query hooks and a dedicated queries layer are not added yet; pages call mutations directly.

---

## Core package (`packages/core`)

| Area | Contents |
|------|----------|
| Types | `user`, `week`, `task`, `energy`, `inbox`, `supplements`, `runner` |
| Logic | `weekGeneration`, `weekUtils`, `focusTimer`, `runnerPrefs` |
| Schemas | `user` (partial; expand as forms harden) |

### Runner settings storage

Focus ritual items and timer lengths are stored on `UserPrefs.runnerSettings`, persisted in Supabase as JSON under `notification_preferences._runnerSettings` (no extra column). See `packages/core/src/logic/runnerPrefs.ts` and `RUNNER_SETTINGS_KEY`.

---

## Stage 1: Foundation — partial

### Done

- pnpm + Turborepo monorepo
- Packages: `core`, `api`, `ui` (minimal), `apps/web`, `apps/mobile` (scaffold)
- Shared `tailwind.config.ts`; Tailwind on web
- TypeScript types and Zod schemas (core types)
- Supabase SQL documented in `docs/SUPABASE_SETUP.md`
- API client + mutations for prefs, week plans, energy, tasks, inbox

### Not done / deferred

- Supabase Auth UI and protected routes (`userId` is still `'temp-user-id'` in web pages)
- Zustand auth store
- IndexedDB / SQLite local-first layer
- Shared `ui` component library
- NativeWind feature parity on mobile
- Automated test suite

---

## Stage 2: Onboarding — done (web)

### Implemented

- Multi-step flow at `/onboarding`: work window, sleep, intensity, recharge, supplements
- `upsertUserPrefs` on completion
- `generateWeekPlan` + `createWeekPlan` for first week
- Components under `apps/web/src/components/onboarding/`

### Gaps

- “Onboarding complete” flag / skip on return visit not wired
- Post-onboarding redirect to `/today` should be verified in flow
- Supplements templates depend on DB seed data

---

## Stage 3: Today Screen — done (web)

### Implemented

| Area | Location |
|------|----------|
| Today page | `apps/web/src/app/today/page.tsx` |
| Energy slider (0–5, Green/Yellow/Red) | `components/today/EnergySlider.tsx` |
| AM energy persist | `upsertEnergyLog` / `getEnergyLog` |
| Primary Block card | `components/today/PrimaryBlockCard.tsx` |
| Top 3 (max 3, complete) | `components/today/Top3Tasks.tsx` |
| Red Day → MVD filter + card | `MvdCard.tsx`, page logic |
| Evening block (work window users) | `components/today/EveningBlockCard.tsx` |

### Gaps

- Task **add** / **edit** UI (handlers stubbed with `console.log`)
- Primary Block **edit** (move/swap/convert) not wired
- PM energy logging not implemented (AM only)
- Red day: shorter Primary Block durations not implemented
- MVD dismiss does not re-show until page reload
- Scheduled time copy uses `Scheduled: {time}` (not “After work: …”)
- Mobile Today screen not started

---

## Stage 4: Focus Runner — done (web)

### Implemented

| Area | Location |
|------|----------|
| Runner page | `apps/web/src/app/runner/focus/` |
| Ritual checklist (customize, skip) | `components/runner/focus/RitualChecklist.tsx` |
| Timer lengths (25–45 focus, 5–10 break) | `TimerSetup.tsx` |
| Two focus blocks + break | `FocusRunnerContent.tsx` phases |
| Countdown + pause/resume/abandon | `FocusTimer.tsx`, `hooks/useCountdownTimer.ts` |
| Background persistence | End timestamp in `sessionStorage` + `visibilitychange` recalc |
| Later capture (timer keeps running) | `LaterCaptureModal.tsx` → `createInboxItem` |
| Hard stop + next step | `HardStopScreen.tsx` → `updateTask` or inbox |
| Session log (optional) | Last 20 entries in `sessionStorage` key `nf_focus_session_log` |
| Navigation from Today | Focus theme only → `/runner/focus` |

### Gaps

- Ambient sound / haptics (optional per spec)
- Web Workers for timers (timestamp approach used instead)
- Later inbox **UI** (Stage 5)
- Mobile Focus Runner not started

---

## Stage 6: All Runners + Sync — partial (web)

### Implemented

| Area | Location |
|------|----------|
| Recharge Runner | `app/runner/recharge/` — type select, ritual, optional timer, return ramp |
| Flex Sprint | `app/runner/flex/` — zones, checklist, timer, next step |
| Admin Sprint | `app/runner/admin/` — multi-category, checklist, timer, next step |
| Today → all themes | `getRunnerPath()` in `packages/core/src/logic/runnerNavigation.ts` |
| Shared sprint UI | `components/runner/shared/` — SprintTimer, SprintChecklist, NextStepCapture |
| TanStack Query | `QueryProvider` in root layout; `useWeekPlan`, `useTasks` hooks |
| Offline queue (foundation) | `lib/offlineQueue.ts`, `OfflineSyncListener` |

### Gaps

- Full optimistic updates + mutation hooks for all entities
- Conflict resolution UI
- Offline queue handlers (drain is stub)
- Mobile runners not started

---

## Manual test checklist (Stages 3–6)

### Implemented

| Area | Location |
|------|----------|
| App navigation | `components/layout/AppNav.tsx` — Today / Week / Sunday Setup + Sunday banner |
| Weekly rhythm view | `app/week/page.tsx`, `components/week/WeekGlance.tsx` |
| Day detail + Primary Block edit | `components/week/DayDetailView.tsx` |
| Day theme swap/reorder | `WeekPlanEditor.tsx`, `weekUtils.swapDayThemes` |
| Later inbox | `components/week/InboxPanel.tsx` — promote, soft-delete, limits, Sunday prune prompt |
| Task board (This Week / Today / Done) | `components/week/TaskBoard.tsx` |
| Sunday Setup (4 steps) | `app/sunday-setup/page.tsx` |
| Week helpers | `packages/core/src/logic/weekUtils.ts` |

### Gaps

- Supplements check-in step is placeholder (no supplement API yet)
- Drag-and-drop reorder (swap buttons used instead)
- Archive done tasks deferred
- Promoted inbox items remain in list (linked via `promotedToTaskId`)
- Mobile not started

| 7 | Polish + Deploy | Done (web) | Web |
| 8 | Buffer + optional | Not started | — |

---

## Stage 7: Polish + Deploy — done (web)

### Implemented

| Area | Location |
|------|----------|
| Settings | `/settings` — accessibility, notifications, analytics opt-in |
| High contrast + reduced motion | `UserPrefsProvider` + `globals.css` |
| Web notifications | `webNotifications.ts` — permission, anchors, Red day suppression, max 2/day |
| Analytics (opt-in) | `lib/analytics.ts` — PostHog capture API, no sensitive text |
| PWA manifest | `public/manifest.json` |
| Deploy config | `vercel.json`, `docs/DEPLOYMENT.md`, `.env.example` |
| A11y polish | skip link, aria on nav/slider, min tap targets, security headers |

### Gaps

- Mobile Expo notifications (Stage 7.1 mobile)
- Service worker for background web notifications
- PWA icons (add `icon-192.png`, `icon-512.png`)
- EAS mobile build not configured
- Full QA matrix / automated tests

---

## Manual test checklist (Stages 3–7)

Prerequisites: Supabase project configured, `.env.local` in `apps/web`, schema from `docs/SUPABASE_SETUP.md`, test user row matching `temp-user-id` or swap to real auth when available.

1. **Today — energy:** Move slider; confirm save (network tab → `energy_logs` upsert).
2. **Today — Red day:** Set energy 0–1; MVD card shows; Top 3 shows MVD-only label.
3. **Today — Primary Block:** Theme matches `week_plans.day_themes` for today.
4. **Today — complete task:** Checkbox marks task `done`.
5. **Focus — entry:** On a Focus day, Start opens `/runner/focus`.
6. **Focus — ritual:** Customize items; Begin or Skip starts timers.
7. **Focus — Later:** During timer, Later saves to `inbox_items` without stopping countdown.
8. **Focus — hard stop:** After block 2, optional next step; Done returns to `/today`.
9. **Focus — background:** Start timer, switch tab 30s, return; remaining time should be accurate.
10. **Week — glance:** Open `/week`; 7 chips show F/R/X/A; today highlighted; work-window band on workdays.
11. **Week — day detail:** Tap a day; edit theme, swap with adjacent day, shift time.
12. **Week — inbox:** Promote item to task; delete item; warning at 15+ items.
13. **Week — tasks:** Move tasks between This Week / Today / Done columns.
14. **Sunday Setup:** Complete 4 steps; new/updated `week_plans` row with outcomes.
15. **Recharge:** Start from Recharge day → type → ritual → optional timer → return ramp.
16. **Flex:** Zone select → sprint checklist + timer → next step capture.
17. **Admin:** Multi-category → sprint → next step capture.
18. **Today routing:** Each theme opens correct `/runner/*` path.
19. **Settings:** Toggle high contrast / reduced motion; enable notifications.
20. **Red day notifications:** Energy 0–1 suppresses anchor notifications unless override on.
21. **Analytics:** Opt-in only; events fire after toggle (check network if PostHog key set).

---

## Git milestones

| Commit | Stage |
|--------|-------|
| `94e331f` | Stage 1 — monorepo foundation |
| `c6b58d0` | Stage 2 — onboarding |
| `83e8a32` | Stage 3 — Today screen + energy |
| *(uncommitted)* | Stage 4 — Focus Runner |
| *(uncommitted)* | Stage 5 — Weekly view + Sunday Setup + Inbox |

---

## Next: Stage 8 (optional)

Per `PRODUCT_SPEC.md`: body-doubling presence, bug fixes, performance, user feedback.

---

## Related docs

- `PRODUCT_SPEC.md` — product requirements and full stage task lists
- `AGENTS.md` — engineering principles
- `docs/SUPABASE_SETUP.md` — database setup (Polish + SQL)
- `README.md` — getting started and architecture overview
