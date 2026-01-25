/**
 * Nature Pharmacy Mobile App
 * Entry point for the React Native application
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store } from './src/store/store';
import { ErrorBoundary } from './src/components';
import { ToastProvider } from './src/hooks';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/constants';
import { initErrorTracking } from './src/utils/errorTracking';

// Ignore specific warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'ViewPropTypes will be removed',
    'ColorPropType will be removed',
  ]);
}

const App: React.FC = () => {
  useEffect(() => {
    // Initialize error tracking (Sentry)
    initErrorTracking();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ErrorBoundary>
            <ToastProvider>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.background}
                translucent={false}
              />
              <AppNavigator />
            </ToastProvider>
          </ErrorBoundary>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
