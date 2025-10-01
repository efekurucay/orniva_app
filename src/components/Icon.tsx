import React from 'react';
import { ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

export type IconName = keyof typeof Ionicons.glyphMap;

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;

export type IconColor = 'primary' | 'secondary' | 'text' | 'textSecondary' | 'success' | 'error' | 'warning' | 'accent' | 'white' | string;

interface IconProps {
  /**
   * Name of the Ionicon to display
   * @example 'camera-outline', 'settings-outline', 'trash-outline'
   */
  name: IconName;
  
  /**
   * Size of the icon
   * Can be a preset size or a custom number
   */
  size?: IconSize;
  
  /**
   * Color of the icon
   * Can be a theme color or a custom hex color
   */
  color?: IconColor;
  
  /**
   * Custom style for the icon
   */
  style?: ViewStyle;
}

/**
 * Icon Component
 * 
 * A themed wrapper around Ionicons that automatically adapts to the app theme.
 * 
 * @example
 * // Basic usage
 * <Icon name="camera-outline" />
 * 
 * @example
 * // With size and color
 * <Icon name="settings-outline" size="lg" color="primary" />
 * 
 * @example
 * // Custom size and hex color
 * <Icon name="heart" size={28} color="#FF0000" />
 */
export function Icon({ name, size = 'md', color = 'text', style }: IconProps) {
  const { theme, colors } = useTheme();
  
  // Resolve size to number
  const iconSize = typeof size === 'number' 
    ? size 
    : {
        xs: theme.iconSizes.sm,    // 16
        sm: theme.iconSizes.md,    // 24
        md: theme.iconSizes.lg,    // 32
        lg: theme.iconSizes.xl,    // 40
        xl: 48,                     // Extra large
        xxl: 64,                    // Extra extra large
      }[size];
  
  // Resolve color to hex value
  const iconColor = (() => {
    // If it's a hex color or named color, return as-is
    if (color.startsWith('#') || color === 'white') {
      return color;
    }
    
    // Map theme color names to actual colors
    const colorMap: Record<string, string> = {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      text: colors.textPrimary,
      textSecondary: colors.textSecondary,
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
    };
    
    return colorMap[color] || colors.textPrimary;
  })();
  
  return (
    <Ionicons 
      name={name} 
      size={iconSize} 
      color={iconColor} 
      style={style}
    />
  );
}

/**
 * Icon with gradient color (for special emphasis)
 * Note: Not implemented yet - would require MaskedView
 * For now, use Icon with color="primary"
 */
export { Icon as GradientIcon };
