/**
 * Main Navigator - Bottom Tab Navigation
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAppSelector } from '@store/store';
import { CountBadge } from '@components';
import { COLORS, SPACING } from '@utils/constants';
import type { MainTabParamList } from '@types';

// Import screens (will be created next)
import HomeScreen from '@screens/Home/HomeScreen';
import CategoriesScreen from '@screens/Categories/CategoriesScreen';
import CartScreen from '@screens/Cart/CartScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Icon components (using emoji for now, replace with react-native-vector-icons later)
const TabIcon: React.FC<{ name: string; focused: boolean; badge?: number }> = ({
  name,
  focused,
  badge,
}) => {
  const icons: { [key: string]: string } = {
    Home: '🏠',
    Categories: '📂',
    Cart: '🛒',
    Profile: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{icons[name]}</Text>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <CountBadge count={badge} />
        </View>
      )}
    </View>
  );
};

const MainNavigator: React.FC = () => {
  const cartItemsCount = useAppSelector(state => state.cart.totalItems);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon
            name={route.name}
            focused={focused}
            badge={route.name === 'Cart' ? cartItemsCount : undefined}
          />
        ),
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Catégories',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Panier',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.lg : SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  iconFocused: {
    transform: [{ scale: 1.1 }],
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
  },
});

export default MainNavigator;
