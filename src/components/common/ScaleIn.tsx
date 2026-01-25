/**
 * ScaleIn Animation Component
 * Scale in animation with optional bounce
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface ScaleInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  bounce?: boolean;
  style?: ViewStyle;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  duration = 300,
  delay = 0,
  bounce = false,
  style,
}) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (bounce) {
      // Spring animation with bounce
      Animated.spring(scale, {
        toValue: 1,
        delay,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      // Regular timing animation
      Animated.timing(scale, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [scale, duration, delay, bounce]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
