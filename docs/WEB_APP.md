# Web App Guide

Quick reference for the Next.js web app (`apps/web`).

## Routes

| Path | File | Description |
|------|------|-------------|
| `/` | `src/app/page.tsx` | Landing (placeholder) |
| `/onboarding` | `src/app/onboarding/page.tsx` | First-run setup |
| `/today` | `src/app/today/page.tsx` | Main daily hub |
| `/week` | `src/app/week/page.tsx` | Weekly rhythm, Later inbox, task board |
| `/sunday-setup` | `src/app/sunday-setup/page.tsx` | Sunday Minimum (4-step weekly planning) |
| `/runner/focus` | `src/app/runner/focus/page.tsx` | Focus Runner (Suspense wrapper) |

Query params:

- `/runner/focus?taskId={uuid}` — associates hard-stop next step with a Today task

## Navigation

`AppNav` (`src/components/layout/AppNav.tsx`) links **Today**, **Week**, and **Sunday Setup**. On Sundays, a banner prompts users to run Sunday Setup.

## Component map

### Layout

- `AppNav` — top navigation + Sunday banner

### Today (`src/components/today/`)

- `EnergySlider` — 0–5 scale, Green/Yellow/Red label, auto-save on change
- `PrimaryBlockCard` — day theme, scheduled time, Start button
- `Top3Tasks` — up to 3 tasks, checkbox complete, add/edit hooks (edit TBD)
- `MvdCard` — Red day minimum viable day messaging
- `EveningBlockCard` — after-work block for work-window users

### Week (`src/components/week/`)

- `WeekGlance` — 7 day chips (F/R/X/A), work-window overlay, today highlight
- `DayDetailView` — day theme, tasks, Primary Block edit (convert, swap, time shift)
- `WeekPlanEditor` — swap themes between adjacent days (Sunday Setup + preview)
- `InboxPanel` — Later inbox promote/delete, limits, Sunday prune prompt
- `TaskBoard` — This Week / Today / Done columns with move buttons

### Focus Runner (`src/components/runner/focus/`)

- `RitualChecklist` — pre-focus checklist, customize, skip
- `TimerSetup` — focus (25–45 min) and break (5–10 min) selectors
- `FocusTimer` — countdown UI, pause/resume/abandon, Later button
- `LaterCaptureModal` — quick inbox capture without stopping timer
- `HardStopScreen` — end-of-session next tiny step

### Hooks

- `src/hooks/useCountdownTimer.ts` — end-timestamp timer with `sessionStorage` persistence

## Environment

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development

```bash
pnpm --filter @neurodivergent-flow/web dev
```

Open [http://localhost:3000/today](http://localhost:3000/today) after onboarding (or directly for UI work).

## Temporary auth placeholder

Pages use `const userId = 'temp-user-id'`. Replace with Supabase Auth session when Stage 1.3 auth is complete. Until then, seed test data for that user id or align RLS policies for local dev.

## Starting Focus from Today

`PrimaryBlockCard` **Start** navigates to `/runner/focus` only when today's theme is `focus`. Other themes log to console until Stage 6 runners ship.

## Week page tabs

`/week` has three tabs:

1. **Week** — tap a day chip for detail and Primary Block edits
2. **Later** — inbox from Focus Runner captures; promote to task or delete
3. **Tasks** — move items between This Week, Today, and Done

## Sunday Setup

`/sunday-setup` steps:

1. Choose intensity (Light / Normal / Heavy)
2. Confirm/edit generated week plan (swap adjacent days)
3. Weekly outcomes (up to 3)
4. Supplements check-in (placeholder until supplement API exists)

On Sunday, saves plan for the upcoming week (Monday start). On other days, updates the current week.
