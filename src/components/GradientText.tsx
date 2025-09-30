import React from 'react';
import { Text, TextStyle, View, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';

interface GradientTextProps {
  children: string;
  variant?: 'primary' | 'accent' | 'neon';
  style?: TextStyle;
  numberOfLines?: number;
}

export function GradientText({
  children,
  variant = 'primary',
  style,
  numberOfLines,
}: GradientTextProps) {
  const { theme } = useTheme();

  // Get gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return theme.gradients.primary; // Purple → Indigo → Blue
      case 'accent':
        return theme.gradients.accent; // Light purple → Yellow
      case 'neon':
        return theme.gradients.neon; // Purple → Blue → Yellow
      default:
        return theme.gradients.primary;
    }
  };

  const gradientColors = getGradientColors();

  return (
    <MaskedView
      maskElement={
        <View style={styles.maskContainer}>
          <Text
            style={[
              styles.text,
              style,
              { backgroundColor: 'transparent' },
            ]}
            numberOfLines={numberOfLines}
          >
            {children}
          </Text>
        </View>
      }
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text
          style={[
            styles.text,
            style,
            { opacity: 0 }, // Hidden but maintains layout
          ]}
          numberOfLines={numberOfLines}
        >
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  maskContainer: {
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
  },
  text: {
    // Base text style - will be overridden by style prop
  },
});
