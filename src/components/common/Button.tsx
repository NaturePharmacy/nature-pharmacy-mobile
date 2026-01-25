/**
 * Button Component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@utils/constants';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  ...props
}) => {
  const buttonStyle: ViewStyle[] = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      {...props}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.text.white}
          accessibilityLabel="Chargement en cours"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_secondary: {
    backgroundColor: COLORS.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  button_text: {
    backgroundColor: 'transparent',
  },
  button_small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  button_medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  button_large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  text_primary: {
    color: COLORS.text.white,
  },
  text_secondary: {
    color: COLORS.text.white,
  },
  text_outline: {
    color: COLORS.primary,
  },
  text_text: {
    color: COLORS.primary,
  },
  text_small: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  text_medium: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  text_large: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  textDisabled: {
    opacity: 0.6,
  },
});

export default Button;
