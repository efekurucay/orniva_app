import React from 'react';
import { Image, ViewStyle } from 'react-native';

type BirdIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;

interface BirdIconProps {
  /**
   * Size of the bird icon
   * Can be a preset size or a custom number
   */
  size?: BirdIconSize;
  
  /**
   * Custom style for the icon
   */
  style?: ViewStyle;
}

/**
 * BirdIcon Component
 * 
 * Displays the app's bird icon from assets.
 * This provides a consistent brand icon across the app.
 * 
 * @example
 * <BirdIcon size="md" />
 * 
 * @example
 * <BirdIcon size={48} />
 */
export function BirdIcon({ size = 'md', style }: BirdIconProps) {
  // Resolve size to number
  const iconSize = typeof size === 'number' 
    ? size 
    : {
        xs: 16,
        sm: 24,
        md: 32,
        lg: 40,
        xl: 48,
        xxl: 64,
      }[size];
  
  return (
    <Image
      source={require('../../assets/icon.png')}
      style={[
        {
          width: iconSize,
          height: iconSize,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}
