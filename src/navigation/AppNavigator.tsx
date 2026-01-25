/**
 * App Navigator - Root Navigation
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '@store/store';
import { loadStoredAuth } from '@store/slices/authSlice';
import { loadCartFromStorage } from '@store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@utils/constants';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { Loading } from '@components';
import { logDebug } from '@utils/logger';
import { navigationRef } from '@utils/navigationRef';

import type { RootStackParamList } from '@types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load stored auth
      await dispatch(loadStoredAuth()).unwrap();

      // Load stored cart
      const cartStr = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      if (cartStr) {
        const cart = JSON.parse(cartStr);
        dispatch(loadCartFromStorage(cart));
      }
    } catch (error) {
      logDebug('No stored auth found', error, 'AppNavigator');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'white' },
        }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
