import posthog from 'posthog-js';
import * as Sentry from '@sentry/react';

// Initialize PostHog and Sentry once. These libraries are optional, so wrap their
// initialization in try / catch blocks to prevent them from blocking the app if
// API keys are missing or they fail to load for any reason (e.g. CSP).

export const initAnalytics = () => {
  // ----- PostHog ---------------------------------------------------------- //
  try {
    const key = import.meta.env.VITE_POSTHOG_KEY ?? '';
    if (key) {
      posthog.init(key, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        autocapture: true,
      });
    }
  } catch (err) {
    console.warn('PostHog analytics disabled:', err);
  }

  // ----- Sentry ----------------------------------------------------------- //
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN ?? '';
    if (dsn) {
      Sentry.init({
        dsn,
        tracesSampleRate: 1.0,
      });
    }
  } catch (err) {
    console.warn('Sentry disabled:', err);
  }
};

export const captureEvent = (name: string, props: Record<string, any> = {}) => {
  try {
    posthog.capture(name, props);
  } catch (_ignored) {
    /* PostHog may not be initialised – swallow */
  }
};

export const captureError = (err: unknown) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Sentry as any).captureException(err);
  } catch (_ignored) {
    console.error('Captured error (Sentry offline):', err);
  }
}; 