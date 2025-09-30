import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { getConfidenceTier, confidenceTiers, getConfidenceColor } from '../theme/tokens';

interface ConfidenceBadgeProps {
  confidence: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  variant?: 'solid' | 'outline' | 'gradient';
}

export function ConfidenceBadge({
  confidence,
  size = 'medium',
  showLabel = false,
  variant = 'gradient',
}: ConfidenceBadgeProps) {
  const { theme, isDark } = useTheme();
  
  const tier = getConfidenceTier(confidence);
  const tierInfo = confidenceTiers[tier];
  const color = getConfidenceColor(confidence, isDark);

  // Get gradient colors based on confidence tier
  const getGradientColors = () => {
    if (tier === 'confirmed') {
      return theme.gradients.success;
    } else if (tier === 'high') {
      return theme.gradients.button; // Purple gradient
    } else if (tier === 'medium') {
      return theme.gradients.warning;
    } else {
      return ['#64748B', '#475569']; // Gray gradient
    }
  };

  // Get glow effect based on tier
  const getGlowEffect = () => {
    if (tier === 'confirmed') {
      return {
        shadowColor: theme.colors.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
      };
    } else if (tier === 'high') {
      return theme.glowEffects.purple;
    } else if (tier === 'medium') {
      return theme.glowEffects.yellow;
    } else {
      return theme.shadows.none;
    }
  };

  // Get sizing based on size prop
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.caption.fontSize;
      case 'medium':
        return theme.typography.bodySmall.fontSize;
      case 'large':
        return theme.typography.body.fontSize;
      default:
        return theme.typography.bodySmall.fontSize;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: theme.spacing.xs, paddingVertical: theme.spacing.xxs };
      case 'medium':
        return { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs };
      case 'large':
        return { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm };
      default:
        return { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs };
    }
  };

  const gradientColors = getGradientColors();
  const glowEffect = getGlowEffect();
  const fontSize = getFontSize();
  const padding = getPadding();

  // Render gradient variant
  if (variant === 'gradient' && tier !== 'low') {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.badge,
          padding,
          {
            borderRadius: theme.borderRadius.lg,
            ...glowEffect,
          },
        ]}
      >
        <Text style={[styles.text, { fontSize, color: '#FFFFFF', fontWeight: '600' }]}>
          {tierInfo.icon && `${tierInfo.icon} `}
          {confidence}%
          {showLabel && ` ${tierInfo.label}`}
        </Text>
      </LinearGradient>
    );
  }

  // Render solid variant
  if (variant === 'solid') {
    return (
      <View
        style={[
          styles.badge,
          padding,
          {
            backgroundColor: tier === 'low' ? 'transparent' : color,
            borderRadius: theme.borderRadius.lg,
            ...(tier !== 'low' ? glowEffect : theme.shadows.none),
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize,
              color: tier === 'low' ? color : '#FFFFFF',
              fontWeight: '600',
            },
          ]}
        >
          {tierInfo.icon && `${tierInfo.icon} `}
          {confidence}%
          {showLabel && ` ${tierInfo.label}`}
        </Text>
      </View>
    );
  }

  // Render outline variant
  return (
    <View
      style={[
        styles.badge,
        padding,
        {
          borderWidth: 2,
          borderColor: color,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize,
            color: color,
            fontWeight: '600',
          },
        ]}
      >
        {tierInfo.icon && `${tierInfo.icon} `}
        {confidence}%
        {showLabel && ` ${tierInfo.label}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    textAlign: 'center',
  },
});
