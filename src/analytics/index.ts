import * as Sentry from '@sentry/react';

let posthog: typeof import('posthog-js') | null = null;
let Sentry: typeof import('@sentry/react') | null = null;

export const initAnalytics = async () => {
  try {
    posthog = (await import('posthog-js')).default;
    posthog.init(import.meta.env.VITE_POSTHOG_KEY || '', {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      autocapture: true,
    });
  } catch (err) {
    // PostHog is optional – log and continue if it fails to load (e.g., blocked by CSP)
    console.warn('PostHog analytics disabled:', err);
  }

  try {
    Sentry = await import('@sentry/react');
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      tracesSampleRate: 1.0,
    });
  } catch (err) {
    console.warn('Sentry disabled:', err);
  }
};

export const captureEvent = (name: string, props: Record<string, any> = {}) => {
  if (posthog) {
    posthog.capture(name, props);
  }
};

export const captureError = (err: any) => {
  if (Sentry) {
    Sentry.captureException(err);
  } else {
    console.error('Captured error (Sentry offline):', err);
  }
}; 