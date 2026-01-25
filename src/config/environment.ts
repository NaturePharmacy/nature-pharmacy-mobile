/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

type Environment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  apiBaseUrl: string;
  paypalClientId: string;
  paypalEnvironment: 'sandbox' | 'production';
  sentryDsn: string;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  cacheTimeout: number;
  imageBaseUrl: string;
}

const developmentConfig: EnvironmentConfig = {
  apiBaseUrl: 'http://localhost:3000/api',
  paypalClientId: 'YOUR_SANDBOX_CLIENT_ID',
  paypalEnvironment: 'sandbox',
  sentryDsn: '',
  enableAnalytics: false,
  enableCrashReporting: false,
  logLevel: 'debug',
  cacheTimeout: 60000, // 1 minute
  imageBaseUrl: 'http://localhost:3000/uploads',
};

const stagingConfig: EnvironmentConfig = {
  apiBaseUrl: 'https://staging-api.naturepharmacy.com/api',
  paypalClientId: 'YOUR_SANDBOX_CLIENT_ID',
  paypalEnvironment: 'sandbox',
  sentryDsn: 'https://staging-sentry-dsn',
  enableAnalytics: true,
  enableCrashReporting: true,
  logLevel: 'info',
  cacheTimeout: 300000, // 5 minutes
  imageBaseUrl: 'https://staging-cdn.naturepharmacy.com',
};

const productionConfig: EnvironmentConfig = {
  apiBaseUrl: 'https://api.naturepharmacy.com/api',
  paypalClientId: 'YOUR_PRODUCTION_CLIENT_ID',
  paypalEnvironment: 'production',
  sentryDsn: 'https://production-sentry-dsn',
  enableAnalytics: true,
  enableCrashReporting: true,
  logLevel: 'error',
  cacheTimeout: 600000, // 10 minutes
  imageBaseUrl: 'https://cdn.naturepharmacy.com',
};

const configs: Record<Environment, EnvironmentConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

// Determine current environment
const getCurrentEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  // In production builds, check for staging flag or default to production
  // This could be enhanced with react-native-config or similar
  return 'production';
};

export const ENV: Environment = getCurrentEnvironment();
export const config: EnvironmentConfig = configs[ENV];

// Export individual config values for convenience
export const {
  apiBaseUrl,
  paypalClientId,
  paypalEnvironment,
  sentryDsn,
  enableAnalytics,
  enableCrashReporting,
  logLevel,
  cacheTimeout,
  imageBaseUrl,
} = config;

// Helper to check environment
export const isDevelopment = ENV === 'development';
export const isStaging = ENV === 'staging';
export const isProduction = ENV === 'production';
