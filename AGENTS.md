# agents.md

Operational rules and shared context for all contributors (engineers, designers,
product) working on this repo. This document is the source of truth for decision-
making, scope boundaries, and quality standards.

**Last updated:** [date]  
**Maintained by:** [lead/PM]  
**Review cadence:** Quarterly or after major pivots

---

## 1. Project Summary

**Name:** Neurodivergent Flow

**Vision:** Help ADHD/autistic adults build sustainable weekly rhythms with
minimal setup, energy-aware simplification, and compassionate scaffolding.

**Core mechanics:**
- Each day has exactly ONE **Primary Block** (day theme): Focus / Recharge / Flex
  / Admin.
- Optional **Work Window overlay**: reserved time that shifts Primary Block to
  evenings; not a competing block type.
- **Week intensity**: Light/Normal/Heavy (day-theme distribution).
- **Energy modes**: Green/Yellow/Red. Red triggers MVD (Minimum Viable Day) +
  suppresses non-essential notifications.

**Design philosophy:** "Sustainable by default." No moralizing. No medical claims.

**Primary audience:** Adults (employed, freelance, or not working) managing work
and household with executive-function challenges.

---

## 2. Stack & Technical Constraints (Non-negotiable)

### Core stack
- **Monorepo:** pnpm + Turborepo
- **Mobile:** React Native (Expo)
- **Web:** Next.js (PWA-ready)
- **Backend:** Supabase (Auth, Postgres, Realtime, Storage, Edge Functions)

### Local-first + sync
- **Mobile:** SQLite (preferred for structured data; MMKV only if data stays <10MB)
- **Web:** IndexedDB
- All user data must be readable offline.

### Styling & design tokens
- **Web:** Tailwind CSS
- **Mobile:** NativeWind (Tailwind utilities for React Native)
- **Shared:** Tailwind config (tokens source of truth; both platforms consume it)

### State + data handling
- **UI state:** Zustand
- **Server sync:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Analytics:** PostHog (opt-in; never track sensitive text)

### Deployment
- **Mobile:** EAS (Expo Application Services)
- **Web:** TBD (to be determined during development)

---

## 3. Non-negotiable Product Principles

These principles override feature requests and design debates.

### 3.1 Reduce cognitive load
- Show **one obvious next action** at a time.
- Hard caps: Top 3 items max, 2 notifications per day by default.
- Default plans; minimize user choice.

### 3.2 Support transitions
- Work → evening block (clear visual/temporal boundary).
- Focus → Recharge (explicit "switch" action with ritual).
- Recharge → small Flex (optional "return ramp" prompt).

### 3.3 Energy-aware, never punitive
- Red Day = automatic plan simplification to MVD.
- Always include "Skip is fine" messaging.
- Never imply shame or failure.

### 3.4 Local-first + privacy-respecting
- App must function completely offline.
- Sync is additive; conflicts prefer safety (non-destructive merges).
- Analytics: opt-in only, never log task content or sensitive data.

### 3.5 No medical advice
- Supplements module = reminders + templates only.
- Conservative framing: "If you already take X…", "Ask a clinician if…"
- Never recommend doses, claim efficacy, or infer conditions.

---

## 4. Definitions (Use Consistently)

### Block types (Primary Block)
| Type | Definition | Example duration |
|------|------------|------------------|
| **Focus** | Deep work, priority projects (high demand) | 25–45 min |
| **Recharge** | Intentional recovery; low demand | 30–90 min |
| **Flex** | Errands, chores, social, appointments (mixed) | 10–30 min |
| **Admin** | Planning, bills, email, prep (medium) | 15–30 min |

### Work Window
Reserved structured time. Does NOT compete as a Primary Block. Visually
recognizable. On workdays, shifts Primary Block to evenings.

### Energy modes
| Mode | Plan | Notifications | Message |
|------|------|---------------|---------|
| **Green** | Normal | All anchors | "Go for it." |
| **Yellow** | Smaller durations/simplified | Core only | "Take it easy." |
| **Red** | MVD only | Core only | "Skip is fine." |

### MVD (Minimum Viable Day)
Smallest plan that "counts" even on hard days. User-defined but default:
- 1 essential task (e.g., "5-min admin")
- 1 body-care item (water/food/meds reminder if enabled)
- 1 micro-reset (2–5 min home reset or movement)

---

## 5. Product Scope: MVP vs. Post-MVP

### What is IN scope (MVP, ship by Week 6)
- Onboarding (2 min)
- Today screen (energy + Primary Block + Top 3 + MVD)
- 4 Runners (Focus, Recharge, Flex Sprint, Admin Sprint)
- Week-at-a-glance (day themes + Work Window overlay)
- Sunday Minimum (10 min setup)
- Supplements templates (opt-in, 3–5 templates)
- Local persistence + basic sync
- Accessibility modes (high contrast, reduced motion, large targets)
- Notifications (max 2/day, one-tap actions, Red Day suppression)

### What is OUT of scope (post-MVP)
- Advanced calendar integration
- Habit tracking (separate from task logging)
- Social features (beyond silent body-doubling room)
- Custom color themes (only light/dark/high-contrast)
- AI recommendations
- Mobile-only features that don't have web parity

### Expansion candidates (post-MVP, by demand)
- Recurring tasks
- Collaborative planning (sharing weeks)
- Export/reporting (CSV, weekly summaries)
- Integrations (Slack, Cal.com)

---

## 6. UX & Interaction Rules

### Never:
- Display more than 1 primary CTA on Today screen.
- Show >3 priority items at once.
- Force a choice when you can default.
- Use productivity guilt language ("crush," "hustle," "discipline").

### Always:
- Provide an exit ramp (e.g., end-of-runner "next tiny step" capture).
- Use progressive disclosure (advanced options behind "More").
- Frame options neutrally ("Try," "If helpful," "Optional").
- Explain *why* a plan changed (e.g., "Red Day: simplified to MVD").

### Copy tone
- Short sentences.
- Concrete, not abstract.
- Non-judgmental.
- Accessible English (no jargon; explain terms on first use).

---

## 7. Notification Policy

### Defaults
- Max 2 notifications per day (bundled by anchors: AM, PM).
- Each notification must include a **one-tap action button**:
  - "Start Focus Runner"
  - "Start Recharge Runner"
  - "Start Reset"
  - "Downshift Checklist"

### Red Day behavior
- Suppress all non-essential notifications.
- Show only core reminders (meds, water, if enabled).
- Include "skip is fine" in copy.

### Nag prevention
- If user misses a notification 2× in a row, switch to **one daily check-in** at
  anchor time or allow "snooze to next anchor" instead of repeating.

---

## 8. Supplements Module: Safety + Tone Rules

### Framing
- Always include visible disclaimer:
  - "Not medical advice. Verify interactions and suitability with a clinician."
- Templates are **opt-in and fully editable**.
- Default templates are conservative:
  - "If you already take X…"
  - "Ask clinician if you have Y condition or take Z medication."

### What to track
- Timing anchors (AM, with breakfast, PM, before bed)
- With-food flag
- Avoid-with notes (e.g., "avoid caffeine")
- Refill reminders + order links
- User's taken/skipped log

### What NOT to do
- Recommend specific doses tailored to symptoms.
- Claim efficacy for ADHD, autism, or any condition.
- Infer medical conditions from user behavior.
- Suggest stacking without explicit user opt-in and strong disclaimers.

### Template guardrails
- Max 3–5 starter templates (Basics, Sleep, Busy Day, Focus-friendly).
- Each includes "ask clinician if…" flags.
- Users can remove any item from a template.

---

## 9. Data & Sync Rules

### Local-first requirements
All of these must work offline:
- Creating/editing plans, tasks, energy logs
- Supplement logs
- Running timers and capturing "Later" items
- Editing preferences

### Sync strategy
- **Append-only logs** (EnergyLog, SupplementLog): always safe to merge.
- **Mutable docs** (WeekPlan, Task):
  - Store `updatedAt` (ISO 8601), `deviceId`, `revision`
  - Last-write-wins for simple fields
  - For lists (Top 3, Supplements): use stable IDs; avoid array overwrites
- **Deletion:** Always soft-delete. Use `deletedAt` timestamp; never silently remove
  user data.
- **Conflicts:** Merge conservatively; if uncertain, keep both versions and show
  user a choice (rare edge case).

### Data retention
- User data persists indefinitely (local + server).
- Analytics events: retain for 90 days max.
- Deleted accounts: hard-delete user data within 30 days.

---

## 10. Code Standards & Quality

### Language & typing
- **TypeScript everywhere.** No `any` without explicit `// @ts-ignore` comment.
- Zod schemas are the source of truth; derive types from Zod.
- Keep business logic in `packages/core`, not in components.

### Component design
- Keep components small and focused (max 150 lines).
- Avoid prop drilling >2 levels; use Zustand or context.
- All interactive elements must have accessibility attributes (role, aria-label,
  etc.).

### Styling: NativeWind (mobile) + Tailwind (web)

#### NativeWind constraints (MVP)
- Enforce a small set of reusable components (Button, Card, Text, Stack, Slider,
  etc.).
- Keep class strings short; avoid complex utility combinations in JSX.
- Use `@apply` in component files (`styled()` or separate component) to prevent
  one-off styling:
  ```tsx
  // Good:
  const StyledCard = styled(View, "p-4 rounded-lg bg-surface");
  
  // Avoid:
  <View className="p-4 rounded-lg bg-surface border border-gray-300 shadow-md">