import posthog from 'posthog-js';
import * as Sentry from '@sentry/react';

export const initAnalytics = () => {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || '', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    autocapture: true,
  });

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    tracesSampleRate: 1.0,
  });
};

export const captureEvent = (name: string, props: Record<string, any> = {}) => {
  posthog.capture(name, props);
};

export const captureError = (err: any) => {
  Sentry.captureException(err);
}; 