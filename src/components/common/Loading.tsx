/**
 * Loading Component - Spinner and Skeleton Loaders
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@utils/constants';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = COLORS.primary,
  fullScreen = false,
  style,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

// Skeleton Loader Components
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.sm,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.productCardSkeleton}>
      <Skeleton height={150} borderRadius={BORDER_RADIUS.md} />
      <View style={{ padding: SPACING.sm }}>
        <Skeleton width="80%" height={16} style={{ marginBottom: SPACING.xs }} />
        <Skeleton width="60%" height={14} style={{ marginBottom: SPACING.xs }} />
        <Skeleton width="40%" height={18} />
      </View>
    </View>
  );
};

// Product List Skeleton
export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <View style={styles.productListSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
};

// Text Skeleton
interface TextSkeletonProps {
  lines?: number;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({ lines = 3 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={14}
          style={{ marginBottom: SPACING.xs }}
        />
      ))}
    </View>
  );
};

// Circle Skeleton (for avatars)
interface CircleSkeletonProps {
  size?: number;
}

export const CircleSkeleton: React.FC<CircleSkeletonProps> = ({ size = 40 }) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  skeleton: {
    backgroundColor: COLORS.surface,
    opacity: 0.6,
  },
  productCardSkeleton: {
    width: '48%',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  productListSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
});

export default Loading;
