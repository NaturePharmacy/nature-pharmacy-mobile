/**
 * SlideIn Animation Component
 * Slide in animation from different directions
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  duration = 300,
  delay = 0,
  style,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set initial position based on direction
    let initialX = 0;
    let initialY = 0;

    switch (direction) {
      case 'left':
        initialX = -SCREEN_WIDTH;
        break;
      case 'right':
        initialX = SCREEN_WIDTH;
        break;
      case 'top':
        initialY = -SCREEN_HEIGHT;
        break;
      case 'bottom':
        initialY = SCREEN_HEIGHT;
        break;
    }

    translateX.setValue(initialX);
    translateY.setValue(initialY);

    // Animate to final position
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, translateY, direction, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
