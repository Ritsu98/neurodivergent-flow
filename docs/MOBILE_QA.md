# Mobile QA Checklist

Manual test matrix for internal EAS builds (`preview` profile). Run on **one physical Android** and **one physical iOS** device when possible — simulators miss push notification behavior.

**Prerequisites**

- Supabase project configured (`docs/SUPABASE_SETUP.md`)
- `apps/mobile/.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Test user data for `temp-user-id` (or real auth when available)
- Device notifications permission granted in Settings

---

## Onboarding

- [ ] Fresh install shows 5-step onboarding
- [ ] Completing onboarding creates `user_prefs` + `week_plans` in Supabase
- [ ] Skip path (if used) lands on Today
- [ ] Re-open app skips onboarding when `onboarding_complete` flag set

## Today

- [ ] Energy slider saves (check Supabase `energy_logs` when online)
- [ ] Red day (energy 0–1) shows MVD card and filters Top 3
- [ ] Primary Block card matches today's theme from week plan
- [ ] Start opens correct runner route (Focus / Recharge / Flex / Admin)
- [ ] Task checkbox marks task done
- [ ] **Offline:** energy slider updates UI without network; syncs after reconnect

## Runners

- [ ] **Focus:** ritual → dual timer + break → hard stop → return to Today
- [ ] **Focus:** Later capture writes to `inbox_items` without stopping timer
- [ ] **Focus:** background app 30s — timer remaining time still accurate
- [ ] **Recharge:** type → ritual → timer → return ramp → optional Flex 5 min
- [ ] **Flex / Admin:** zone/categories → sprint → next step capture

## Week

- [ ] Week tab shows 7 day chips with today highlighted
- [ ] Day detail: convert theme, swap adjacent day, time shift persists
- [ ] Later inbox: promote to task, delete item, warning at 15+ items
- [ ] Task board: move tasks between This Week / Today / Done

## Sunday Setup

- [ ] 4 steps complete; new/updated `week_plans` row
- [ ] Sunday banner links to Sunday Setup

## Settings

- [ ] High contrast toggle updates UI immediately
- [ ] Reduced motion toggle applies
- [ ] Push notification permission flow works on device
- [ ] Notification toggles persist to Supabase

## Notifications (device only)

- [ ] Downshift reminder schedules when sleep window set
- [ ] Primary Block reminder schedules when work window set
- [ ] Red day suppresses non-essential notifications (unless override on)
- [ ] Tap notification opens correct runner deep link

## Known limitations (MVP)

- Auth is still `temp-user-id` — not production-ready RLS
- M6 sync queue handles energy upserts only; other writes need network
- Haptic feedback on timer complete not implemented
- Custom app icon / splash assets not added (default Expo branding)
- iOS internal distribution requires Apple Developer account + device UDIDs for ad hoc

---

See also: web checklist in `docs/BUILD_PROGRESS.md` (Stages 3–7).
