/**
 * Navigation Reference
 * Allows navigation from outside React components (e.g., API interceptors)
 */

import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from '@types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen from anywhere in the app
 */
export function navigate(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

/**
 * Reset navigation stack and navigate to a screen
 */
export function resetTo(name: keyof RootStackParamList, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      })
    );
  }
}

/**
 * Go back to previous screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Navigate to login and clear auth state
 */
export function navigateToLogin() {
  resetTo('Auth');
}
