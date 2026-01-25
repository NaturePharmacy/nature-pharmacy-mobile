/**
 * Global Error Handler
 * Centralized error handling and logging
 */

import { Alert } from 'react-native';
import { logError } from './logger';

export interface AppError {
  code?: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

// Generic error type for axios-like errors
interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      code?: string;
      field?: string;
    };
  };
  message?: string;
  code?: string;
}

type UnknownError = Error | ApiErrorResponse | unknown;

class ErrorHandler {
  private errors: AppError[] = [];
  private maxErrors = 50; // Keep last 50 errors

  /**
   * Handle API errors
   */
  handleApiError(error: UnknownError): AppError {
    const err = error as ApiErrorResponse;
    const appError: AppError = {
      code: err.response?.status?.toString() || 'UNKNOWN',
      message: this.getErrorMessage(err),
      details: err.response?.data || err.message,
      timestamp: new Date().toISOString(),
    };

    this.logError(appError);
    return appError;
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: UnknownError): AppError {
    const err = error as ApiErrorResponse;
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: 'Erreur de connexion. Vérifiez votre connexion internet.',
      details: err.message,
      timestamp: new Date().toISOString(),
    };

    this.logError(appError);
    return appError;
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: Record<string, string>): AppError {
    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message: 'Veuillez corriger les erreurs dans le formulaire',
      details: errors,
      timestamp: new Date().toISOString(),
    };

    this.logError(appError);
    return appError;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: UnknownError): AppError {
    const err = error as ApiErrorResponse;
    const appError: AppError = {
      code: 'AUTH_ERROR',
      message: 'Session expirée. Veuillez vous reconnecter.',
      details: err.message,
      timestamp: new Date().toISOString(),
    };

    this.logError(appError);
    return appError;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: ApiErrorResponse): string {
    // API error with custom message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // HTTP status code messages
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Requête invalide. Veuillez vérifier vos données.';
        case 401:
          return 'Non autorisé. Veuillez vous connecter.';
        case 403:
          return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        case 404:
          return 'Ressource non trouvée.';
        case 409:
          return 'Conflit. La ressource existe déjà.';
        case 422:
          return 'Données invalides. Veuillez vérifier le formulaire.';
        case 429:
          return 'Trop de requêtes. Veuillez réessayer plus tard.';
        case 500:
          return 'Erreur serveur. Veuillez réessayer plus tard.';
        case 503:
          return 'Service temporairement indisponible.';
        default:
          return 'Une erreur est survenue. Veuillez réessayer.';
      }
    }

    // Network error
    if (error.message === 'Network Error' || !error.response) {
      return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }

    // Generic error
    return error.message || 'Une erreur inattendue est survenue.';
  }

  /**
   * Log error to console and storage
   */
  private logError(error: AppError) {
    logError(`[${error.code}] ${error.message}`, error.details, 'ErrorHandler');

    // Add to error history
    this.errors.unshift(error);

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // TODO: Send to error tracking service in production
    // if (!__DEV__) {
    //   Sentry.captureException(error);
    // }
  }

  /**
   * Show error alert to user
   */
  showErrorAlert(error: AppError, title: string = 'Erreur') {
    Alert.alert(title, error.message, [{ text: 'OK' }]);
  }

  /**
   * Get error history
   */
  getErrorHistory(): AppError[] {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errors = [];
  }

  /**
   * Check if error is specific type
   */
  isNetworkError(error: UnknownError): boolean {
    const err = error as ApiErrorResponse;
    return (
      err.message === 'Network Error' ||
      !err.response ||
      err.code === 'NETWORK_ERROR'
    );
  }

  isAuthError(error: UnknownError): boolean {
    const err = error as ApiErrorResponse;
    return err.response?.status === 401 || err.code === 'AUTH_ERROR';
  }

  isValidationError(error: UnknownError): boolean {
    const err = error as ApiErrorResponse;
    return err.response?.status === 422 || err.code === 'VALIDATION_ERROR';
  }

  isServerError(error: UnknownError): boolean {
    const err = error as ApiErrorResponse;
    return (err.response?.status ?? 0) >= 500;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export helper functions
export const handleError = (error: UnknownError): AppError => {
  if (errorHandler.isNetworkError(error)) {
    return errorHandler.handleNetworkError(error);
  }
  if (errorHandler.isAuthError(error)) {
    return errorHandler.handleAuthError(error);
  }
  return errorHandler.handleApiError(error);
};

export const showError = (error: AppError | string, title?: string) => {
  if (typeof error === 'string') {
    Alert.alert(title || 'Erreur', error);
  } else {
    errorHandler.showErrorAlert(error, title);
  }
};
