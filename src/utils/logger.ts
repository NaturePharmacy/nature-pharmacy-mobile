/**
 * Logger Utility
 * Centralized logging system with environment-aware output
 * Replaces scattered console.log statements
 */

import { Platform } from 'react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  source?: string;
}

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  showTimestamp: boolean;
  showSource: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.config = {
      enabled: __DEV__,
      minLevel: __DEV__ ? 'debug' : 'warn',
      showTimestamp: true,
      showSource: true,
    };
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const parts: string[] = [];

    if (this.config.showTimestamp) {
      parts.push(`[${entry.timestamp}]`);
    }

    parts.push(`[${entry.level.toUpperCase()}]`);

    if (this.config.showSource && entry.source) {
      parts.push(`[${entry.source}]`);
    }

    parts.push(entry.message);

    return parts.join(' ');
  }

  private log(level: LogLevel, message: string, data?: unknown, source?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      source,
    };

    // Add to buffer for potential crash reporting
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    const formattedMessage = this.formatMessage(entry);
    const color = LOG_COLORS[level];

    // Use appropriate console method
    switch (level) {
      case 'debug':
        if (Platform.OS === 'web') {
          console.debug(formattedMessage, data ?? '');
        } else {
          console.log(`${color}${formattedMessage}${RESET_COLOR}`, data ?? '');
        }
        break;
      case 'info':
        console.info(`${color}${formattedMessage}${RESET_COLOR}`, data ?? '');
        break;
      case 'warn':
        console.warn(`${color}${formattedMessage}${RESET_COLOR}`, data ?? '');
        break;
      case 'error':
        console.error(`${color}${formattedMessage}${RESET_COLOR}`, data ?? '');
        break;
    }
  }

  debug(message: string, data?: unknown, source?: string): void {
    this.log('debug', message, data, source);
  }

  info(message: string, data?: unknown, source?: string): void {
    this.log('info', message, data, source);
  }

  warn(message: string, data?: unknown, source?: string): void {
    this.log('warn', message, data, source);
  }

  error(message: string, data?: unknown, source?: string): void {
    this.log('error', message, data, source);
  }

  // Convenience method for API calls
  api(method: string, url: string, data?: unknown): void {
    this.debug(`API ${method} ${url}`, data, 'API');
  }

  // Convenience method for navigation events
  navigation(action: string, screen: string, params?: unknown): void {
    this.debug(`Navigation: ${action} -> ${screen}`, params, 'NAV');
  }

  // Convenience method for user actions
  userAction(action: string, data?: unknown): void {
    this.info(`User action: ${action}`, data, 'USER');
  }

  // Convenience method for state changes
  state(source: string, action: string, data?: unknown): void {
    this.debug(`State change: ${action}`, data, source);
  }

  // Get recent logs for crash reporting
  getRecentLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  // Clear log buffer
  clearBuffer(): void {
    this.logBuffer = [];
  }
}

// Singleton instance
export const logger = new Logger();

// Named exports for convenience
export const logDebug = (message: string, data?: unknown, source?: string) =>
  logger.debug(message, data, source);
export const logInfo = (message: string, data?: unknown, source?: string) =>
  logger.info(message, data, source);
export const logWarn = (message: string, data?: unknown, source?: string) =>
  logger.warn(message, data, source);
export const logError = (message: string, data?: unknown, source?: string) =>
  logger.error(message, data, source);
