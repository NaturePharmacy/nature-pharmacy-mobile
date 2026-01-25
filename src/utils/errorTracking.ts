/**
 * Error Tracking Service
 * Centralized error tracking with Sentry support
 *
 * To enable Sentry:
 * 1. npm install @sentry/react-native
 * 2. npx @sentry/wizard -i reactNative -p ios android
 * 3. Set SENTRY_DSN in environment config
 */

import { isProduction, sentryDsn } from '@config/environment';

// Sentry types (will be available after installing @sentry/react-native)
interface SentryUser {
  id?: string;
  email?: string;
  username?: string;
}

interface SentryContext {
  [key: string]: unknown;
}

// Flag to check if Sentry is initialized
let isSentryInitialized = false;

/**
 * Initialize error tracking service
 * Call this in App.tsx before rendering
 */
export const initErrorTracking = async (): Promise<void> => {
  if (!isProduction || !sentryDsn) {
    console.log('[ErrorTracking] Skipping initialization (dev mode or no DSN)');
    return;
  }

  try {
    // Dynamic import to avoid issues if Sentry is not installed
    const Sentry = await import('@sentry/react-native');

    Sentry.init({
      dsn: sentryDsn,
      environment: isProduction ? 'production' : 'development',
      tracesSampleRate: 0.2, // 20% of transactions
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      attachStacktrace: true,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
        }
        return event;
      },
    });

    isSentryInitialized = true;
    console.log('[ErrorTracking] Sentry initialized');
  } catch (error) {
    console.warn('[ErrorTracking] Failed to initialize Sentry:', error);
  }
};

/**
 * Capture an exception
 */
export const captureException = async (
  error: Error | unknown,
  context?: SentryContext
): Promise<void> => {
  if (!isSentryInitialized) {
    console.error('[ErrorTracking] Exception:', error, context);
    return;
  }

  try {
    const Sentry = await import('@sentry/react-native');

    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch (e) {
    console.error('[ErrorTracking] Failed to capture exception:', e);
  }
};

/**
 * Capture a message
 */
export const captureMessage = async (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): Promise<void> => {
  if (!isSentryInitialized) {
    console.log(`[ErrorTracking] Message (${level}):`, message);
    return;
  }

  try {
    const Sentry = await import('@sentry/react-native');
    Sentry.captureMessage(message, level);
  } catch (e) {
    console.error('[ErrorTracking] Failed to capture message:', e);
  }
};

/**
 * Set user information for error tracking
 */
export const setUser = async (user: SentryUser | null): Promise<void> => {
  if (!isSentryInitialized) return;

  try {
    const Sentry = await import('@sentry/react-native');
    Sentry.setUser(user);
  } catch (e) {
    console.error('[ErrorTracking] Failed to set user:', e);
  }
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = async (
  category: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> => {
  if (!isSentryInitialized) return;

  try {
    const Sentry = await import('@sentry/react-native');
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  } catch (e) {
    console.error('[ErrorTracking] Failed to add breadcrumb:', e);
  }
};

/**
 * Set custom tag
 */
export const setTag = async (key: string, value: string): Promise<void> => {
  if (!isSentryInitialized) return;

  try {
    const Sentry = await import('@sentry/react-native');
    Sentry.setTag(key, value);
  } catch (e) {
    console.error('[ErrorTracking] Failed to set tag:', e);
  }
};
