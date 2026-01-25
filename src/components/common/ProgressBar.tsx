/**
 * Progress Bar Component
 * Animated progress indicator
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS } from '../../utils/constants';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  duration?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = COLORS.primary,
  backgroundColor = COLORS.lightGray,
  animated = true,
  duration = 500,
  style,
}) => {
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressWidth, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      progressWidth.setValue(progress);
    }
  }, [progress, animated, duration, progressWidth]);

  const widthInterpolated = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            width: widthInterpolated,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 999,
  },
});
