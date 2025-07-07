// Lightweight analytics wrapper that *lazily* loads heavy SDKs only when
// their API keys are present. This keeps ~135 KB out of the critical JS path.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let posthog: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;

// Initialise analytics libraries after the first paint.
export const initAnalytics = async (): Promise<void> => {
  // PostHog ---------------------------------------------------------------
  try {
    const key = import.meta.env.VITE_POSTHOG_KEY ?? '';
    if (key) {
      const mod = await import('posthog-js');
      posthog = mod.default ?? mod;
      posthog.init(key, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
        autocapture: true,
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('PostHog disabled:', err);
  }
};

// -----------------------------------------------------------------------
// Helper wrappers that are safe even if SDKs never load
// -----------------------------------------------------------------------
export const captureEvent = (name: string, props: Record<string, any> = {}): void => {
  try {
    if (posthog?.capture) {
      posthog.capture(name, props);
    }
  } catch {
    /* swallow */
  }
};

// Error tracking ----------------------------------------------------------------
export const trackError = (err: Error) => {
  console.error('Error tracked:', err);
};