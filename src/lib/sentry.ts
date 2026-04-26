import * as Sentry from '@sentry/react-native';

let initialized = false;

/**
 * Phase 7 stub — wires Sentry only when `EXPO_PUBLIC_SENTRY_DSN` is set so
 * dev / emulator builds don't pollute a production Sentry project. Release
 * + dist are pulled from `app.config.ts` when present.
 */
export function initSentry(): void {
  if (initialized) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    enableAutoPerformanceTracing: true,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    debug: __DEV__,
  });
  initialized = true;
}
