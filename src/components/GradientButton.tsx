import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  glowIntensity?: 'none' | 'subtle' | 'normal' | 'intense';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GradientButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  glowIntensity = 'normal',
  style,
  textStyle,
}: GradientButtonProps) {
  const { theme, colors, isDark } = useTheme();

  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return theme.gradients.button; // Purple → Indigo
      case 'secondary':
        return theme.gradients.buttonAlt; // Indigo → Blue
      case 'accent':
        return theme.gradients.accent; // Light purple → Yellow
      default:
        return theme.gradients.button;
    }
  };

  // Get glow effect based on intensity
  const getGlowEffect = () => {
    if (disabled || glowIntensity === 'none') {
      return theme.shadows.none;
    }

    switch (glowIntensity) {
      case 'subtle':
        return theme.glowEffects.purple;
      case 'normal':
        return variant === 'accent' 
          ? theme.glowEffects.yellow 
          : theme.glowEffects.purple;
      case 'intense':
        return variant === 'accent'
          ? theme.glowEffects.yellow
          : theme.glowEffects.purpleIntense;
      default:
        return theme.glowEffects.purple;
    }
  };

  // Get button dimensions based on size
  const getButtonHeight = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'medium':
        return 48;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  const getPaddingHorizontal = () => {
    switch (size) {
      case 'small':
        return theme.spacing.sm;
      case 'medium':
        return theme.spacing.md;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };

  // Get text style based on size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.bodySmall;
      case 'medium':
        return theme.typography.body;
      case 'large':
        return theme.typography.bodyLarge;
      default:
        return theme.typography.body;
    }
  };

  const gradientColors = getGradientColors();
  const glowEffect = getGlowEffect();
  const height = getButtonHeight();
  const paddingHorizontal = getPaddingHorizontal();
  const textSize = getTextSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#64748B', '#475569'] : gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            height,
            paddingHorizontal,
            borderRadius: theme.borderRadius.xl,
            ...glowEffect,
          },
          disabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text
              style={[
                styles.text,
                textSize,
                {
                  color: '#FFFFFF',
                  fontWeight: '600',
                  marginLeft: icon ? theme.spacing.xs : 0,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
