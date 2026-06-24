/**
 * Opt-in analytics — never logs task content or sensitive text.
 */

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

let enabled = false;
const distinctIdKey = 'nf_analytics_id';

function getDistinctId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(distinctIdKey);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(distinctIdKey, id);
  }
  return id;
}

export function setAnalyticsEnabled(value: boolean) {
  enabled = value && Boolean(POSTHOG_KEY);
}

export function initAnalytics(optIn: boolean) {
  setAnalyticsEnabled(optIn);
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (!enabled || !POSTHOG_KEY || typeof window === 'undefined') return;

  const safeProps = properties ?? {};
  void fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      properties: {
        ...safeProps,
        distinct_id: getDistinctId(),
        $lib: 'web',
      },
    }),
  }).catch(() => {
    // Analytics must never break the app
  });
}

export const AnalyticsEvents = {
  appOpen: 'app_open',
  energyLogged: 'energy_logged',
  focusSessionComplete: 'focus_session_complete',
  sundaySetupComplete: 'sunday_setup_complete',
  runnerStarted: 'runner_started',
} as const;
