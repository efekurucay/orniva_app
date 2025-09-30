/**
 * Orniva Design System Tokens
 * Based on "Nature Noir" design language
 * All values follow 8pt grid system for consistency
 */

export const colors = {
  light: {
    // Tech Startup Light Mode (for daytime use)
    // Primary & Branding - Purple/Blue gradient theme
    primary: '#6366F1',        // Bright Indigo - main brand color
    primaryLight: '#818CF8',   // Light indigo
    primaryDark: '#4F46E5',    // Deep indigo
    
    secondary: '#8B5CF6',      // Vivid Purple - secondary brand
    secondaryLight: '#A78BFA', // Light purple
    
    accent: '#FCD34D',         // Pastel Yellow - bright accents
    accentAlt: '#F59E0B',      // Amber - alternative accent
    
    // Surfaces & Backgrounds
    background: '#F8FAFC',     // Very light blue-gray
    surface: '#FFFFFF',        // Pure white cards
    surfaceVariant: '#F1F5F9', // Subtle blue-gray elevation
    
    // Text (with gradient support)
    textPrimary: '#0F172A',    // Dark navy
    textSecondary: '#64748B',  // Blue-gray
    textDisabled: '#CBD5E1',   // Light gray
    
    // Semantic Colors
    success: '#10B981',        // Emerald green
    error: '#EF4444',          // Red
    warning: '#F59E0B',        // Amber
    info: '#3B82F6',           // Blue
    
    // Borders & Dividers
    border: '#E2E8F0',
    divider: '#F1F5F9',
    
    // Backward compatibility
    text: '#0F172A',
    cardBackground: '#FFFFFF',
    buttonText: '#FFFFFF',
  },
  
  dark: {
    // Tech Startup Dark Mode - Cyberpunk Aesthetic 🚀
    // Primary & Branding - Neon Purple/Blue
    primary: '#A78BFA',        // Bright purple (neon effect)
    primaryLight: '#C4B5FD',   // Light purple glow
    primaryDark: '#8B5CF6',    // Deep purple
    
    secondary: '#60A5FA',      // Bright blue (tech feel)
    secondaryLight: '#93C5FD', // Light blue
    
    accent: '#FCD34D',         // Pastel yellow (highlight)
    accentAlt: '#FBBF24',      // Golden yellow
    
    // Surfaces & Backgrounds - Dark Navy/Black
    background: '#0F172A',     // Dark navy blue (almost black)
    surface: '#1E293B',        // Elevated dark navy
    surfaceVariant: '#334155', // Card variant with more contrast
    
    // Text - Gradient ready colors
    textPrimary: '#F8FAFC',    // Near white
    textSecondary: '#94A3B8',  // Gray for metadata
    textDisabled: '#475569',   // Darker gray
    
    // Semantic Colors (Neon-adjusted)
    success: '#34D399',        // Bright emerald
    error: '#F87171',          // Bright red
    warning: '#FBBF24',        // Bright amber
    info: '#60A5FA',           // Bright blue
    
    // Borders & Dividers (subtle in dark mode)
    border: '#334155',
    divider: '#1E293B',
    
    // Backward compatibility
    text: '#F8FAFC',
    cardBackground: '#1E293B',
    buttonText: '#0F172A',     // Dark text for light buttons
  },
};

/**
 * Gradient color stops for text and UI elements
 */
export const gradients = {
  // Main brand gradient (purple → blue → yellow)
  primary: ['#8B5CF6', '#6366F1', '#3B82F6'],           // Purple → Indigo → Blue
  accent: ['#A78BFA', '#FCD34D'],                       // Light purple → Pastel yellow
  neon: ['#A78BFA', '#60A5FA', '#FCD34D'],             // Purple → Blue → Yellow (cyberpunk)
  
  // Subtle gradients for backgrounds
  darkBackground: ['#0F172A', '#1E293B'],              // Navy gradient
  lightBackground: ['#F8FAFC', '#FFFFFF'],             // Light gradient
  
  // Button gradients
  button: ['#8B5CF6', '#6366F1'],                      // Purple → Indigo
  buttonAlt: ['#6366F1', '#3B82F6'],                   // Indigo → Blue
  
  // Status gradients
  success: ['#10B981', '#34D399'],
  error: ['#EF4444', '#F87171'],
  warning: ['#F59E0B', '#FBBF24'],
};

/**
 * Spacing system based on 8pt grid
 * All measurements in dp/pt for React Native
 */
export const spacing = {
  xxs: 4,    // 0.5x - Micro-spacing, internal icon separation
  xs: 8,     // 1x   - Small element spacing, icon/label gaps
  sm: 16,    // 2x   - Card padding, screen horizontal margins
  md: 24,    // 3x   - Section separation, content blocks
  lg: 32,    // 4x   - Large component margins, major spacing
  xl: 40,    // 5x   - Image containers, extra large gaps
  xxl: 48,   // 6x   - Touch target minimum (accessibility)
  xxxl: 64,  // 8x   - Major section dividers
};

/**
 * Typography scale following 8pt grid
 * All sizes in pt/sp for React Native
 */
export const typography = {
  display: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  scientific: {
    fontSize: 12,
    fontWeight: '300' as const,
    lineHeight: 16,
    letterSpacing: 0,
    fontStyle: 'italic' as const,
  },
};

/**
 * Border radius values
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

/**
 * Shadow/Elevation system
 */
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

/**
 * Neon glow effects for tech aesthetic 🌟
 */
export const glowEffects = {
  // Purple neon glow
  purple: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  purpleIntense: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  // Blue neon glow
  blue: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  // Yellow/Gold glow
  yellow: {
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 10,
  },
  // Multi-color glow (for special elements)
  multiColor: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
};

/**
 * Animation durations in milliseconds
 */
export const durations = {
  instant: 0,
  fast: 100,
  normal: 200,
  moderate: 300,
  slow: 500,
};

/**
 * Icon sizes
 */
export const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

/**
 * Confidence tier thresholds and styling
 */
export const confidenceTiers = {
  confirmed: {
    threshold: 90,
    label: 'Confirmed ID',
    icon: '✓',
  },
  high: {
    threshold: 80,
    label: 'High Confidence',
    icon: null,
  },
  medium: {
    threshold: 70,
    label: 'Medium Confidence',
    icon: '!',
  },
  low: {
    threshold: 0,
    label: 'Low Confidence',
    icon: '?',
  },
};

/**
 * Get confidence tier based on score
 */
export function getConfidenceTier(confidence: number) {
  if (confidence >= confidenceTiers.confirmed.threshold) return 'confirmed';
  if (confidence >= confidenceTiers.high.threshold) return 'high';
  if (confidence >= confidenceTiers.medium.threshold) return 'medium';
  return 'low';
}

/**
 * Get confidence color based on tier and theme
 */
export function getConfidenceColor(confidence: number, isDark: boolean) {
  const tier = getConfidenceTier(confidence);
  const theme = isDark ? colors.dark : colors.light;
  
  switch (tier) {
    case 'confirmed':
      return theme.success;
    case 'high':
      return theme.primary;
    case 'medium':
      return theme.warning;
    case 'low':
      return theme.textSecondary;
  }
}

export default {
  colors,
  gradients,
  spacing,
  typography,
  borderRadius,
  shadows,
  glowEffects,
  durations,
  iconSizes,
  confidenceTiers,
  getConfidenceTier,
  getConfidenceColor,
};
