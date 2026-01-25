/**
 * Card Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@utils/constants';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  style,
  onPress,
  ...props
}) => {
  const cardStyle: ViewStyle[] = [
    styles.card,
    styles[`card_${variant}`],
    styles[`padding_${padding}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  card_elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card_outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  card_filled: {
    backgroundColor: COLORS.surface,
  },
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: SPACING.sm,
  },
  padding_medium: {
    padding: SPACING.md,
  },
  padding_large: {
    padding: SPACING.lg,
  },
});

export default Card;
