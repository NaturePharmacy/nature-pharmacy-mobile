/**
 * API Service - Axios Configuration
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '@utils/constants';
import { logError, logWarn } from '../utils/logger';
import { navigateToLogin } from '../utils/navigationRef';
import type { ApiError } from '@types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PATH}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      logError('Error retrieving auth token', error, 'API');
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  response => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER]);
          navigateToLogin();
          break;

        case 403:
          // Forbidden - No permission
          logWarn('Access forbidden', data, 'API');
          break;

        case 404:
          // Not found
          logWarn('Resource not found', data, 'API');
          break;

        case 422:
          // Validation error
          logWarn('Validation error', data, 'API');
          break;

        case 429:
          // Rate limit exceeded
          logWarn('Rate limit exceeded', data, 'API');
          break;

        case 500:
        case 502:
        case 503:
          // Server errors
          logError('Server error', data, 'API');
          break;

        default:
          logError('API error', data, 'API');
      }

      return Promise.reject({
        message: data?.message || 'An error occurred',
        code: data?.code,
        field: data?.field,
      } as ApiError);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      } as ApiError);
    } else {
      // Error in request setup
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      } as ApiError);
    }
  }
);

/**
 * Update auth token
 */
export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    logError('Error saving auth token', error, 'API');
  }
};

/**
 * Remove auth token
 */
export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    logError('Error removing auth token', error, 'API');
  }
};

export default api;
