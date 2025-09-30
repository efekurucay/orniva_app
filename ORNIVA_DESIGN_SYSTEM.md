# 🎨 Orniva Design System - Unified Specification

## 📋 Overview

This design system combines insights from two comprehensive UI/UX research reports to create a cohesive, accessible, and delightful bird identification experience. The system adopts **"Nature Noir"** as its design language, balancing vibrant nature photography with modern, sophisticated interfaces.

---

## 🎯 Core Design Principles

1. **Nature-First**: Earth tones and organic patterns that evoke outdoor exploration
2. **Accessibility-First**: WCAG 2.1 AA compliance minimum across all components
3. **Performance-First**: 60fps animations, optimized images, fast interactions
4. **Trust through Transparency**: Clear confidence scoring and AI prediction communication
5. **Progressive Disclosure**: Simple by default, expert mode available

---

## 🌈 Color System

### Light Mode Palette ("Daybreak")

```typescript
const lightColors = {
  // Primary & Branding
  primary: '#0077B6',        // Ocean Teal - CTAs, brand emphasis
  primaryLight: '#4FC3F7',   // Lighter variant
  primaryDark: '#005A8C',    // Darker variant
  
  secondary: '#4B7746',      // Forest Green - supporting actions
  secondaryLight: '#81C784', // Soft mint variant
  
  accent: '#FFB700',         // Goldenrod - highlights, urgent actions
  accentAlt: '#FF7F50',      // Warm coral - alternative accent
  
  // Surfaces & Backgrounds
  background: '#FAFAFA',     // Off-white - main screen
  surface: '#FFFFFF',        // Pure white - cards, elevated components
  surfaceVariant: '#F9F9F9', // Subtle depth/elevation
  
  // Text
  textPrimary: '#212121',    // Deep charcoal - 4.5:1 contrast
  textSecondary: '#6A6A6A',  // Mid-gray - metadata, captions
  textDisabled: '#BDBDBD',   // Light gray
  
  // Semantic Colors
  success: '#10B981',        // Emerald - confirmed identification
  error: '#EF4444',          // Clear red - failed identification
  warning: '#FF9800',        // Orange - medium confidence
  info: '#03A9F4',           // Light blue - tips, guidance
};
```

### Dark Mode Palette ("Nature Noir")

```typescript
const darkColors = {
  // Primary & Branding (Brighter for dark backgrounds)
  primary: '#4FC3F7',        // Lighter sky blue
  primaryLight: '#80D4FA',   // Even lighter variant
  primaryDark: '#0288D1',    // Darker variant
  
  secondary: '#81C784',      // Soft mint green
  secondaryLight: '#A5D6A7', // Lighter mint
  
  accent: '#FFD700',         // Gold - maintains visibility
  accentAlt: '#FB7185',      // Soft pink - less aggressive
  
  // Surfaces & Backgrounds (Deep gray, not true black)
  background: '#121212',     // Deep dark gray - main screen
  surface: '#1E1E1E',        // Slightly lighter - cards, elevation
  surfaceVariant: '#2C2C2C', // Additional depth layer
  
  // Text
  textPrimary: '#F5F5FF',    // Near-white - optimal contrast
  textSecondary: '#A0A0A0',  // Medium light gray
  textDisabled: '#424242',   // Darker gray
  
  // Semantic Colors (Adjusted for dark backgrounds)
  success: '#66BB6A',        // Light green
  error: '#E57373',          // Light red
  warning: '#FFB74D',        // Light orange
  info: '#4FC3F7',           // Lighter blue
};
```

### Semantic Color Usage

| State | Light Mode | Dark Mode | Use Case |
|-------|-----------|-----------|----------|
| **Confirmed ID** (90%+) | #10B981 (Emerald) | #66BB6A (Light Green) | High confidence identifications |
| **High Confidence** (80-89%) | #0077B6 (Primary Teal) | #4FC3F7 (Light Blue) | Standard reliable results |
| **Medium Confidence** (70-79%) | #FF9800 (Orange) | #FFB74D (Light Orange) | Verification suggested |
| **Low Confidence** (<70%) | #6A6A6A (Secondary Gray) | #A0A0A0 (Light Gray) | Uncertain results |

### Gradients (Optional)

```typescript
const gradients = {
  primary: 'linear-gradient(135deg, #0077B6 0%, #4FC3F7 100%)',
  nature: 'linear-gradient(135deg, #4B7746 0%, #81C784 100%)',
  sunset: 'linear-gradient(135deg, #FFB700 0%, #FF7F50 100%)',
};
```

---

## 📝 Typography System

### Font Families

```typescript
const fonts = {
  // System fonts for optimal performance
  primary: Platform.select({
    ios: 'San Francisco',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Alternative for cross-platform consistency
  alternative: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  
  // Scientific names (italic)
  scientific: Platform.select({
    ios: 'San Francisco',
    android: 'Roboto',
    default: 'System',
  }) + ', italic',
};
```

### Type Scale (8pt Grid System)

| Token | Size (pt/sp) | Weight | Line Height | Use Case |
|-------|--------------|--------|-------------|----------|
| **display** | 34 | 700 (Bold) | 40 | Full-screen headers, welcome |
| **h1** | 28 | 600 (SemiBold) | 36 | Primary screen titles |
| **h2** | 20 | 500 (Medium) | 28 | Card headers, modal titles |
| **h3** | 18 | 500 (Medium) | 24 | Subsection headers |
| **body-large** | 18 | 400 (Regular) | 26 | Important content |
| **body** | 16 | 400 (Regular) | 24 | Main reading content (WCAG) |
| **body-small** | 14 | 400 (Regular) | 20 | List items, descriptions |
| **caption** | 12 | 400 (Regular) | 16 | Timestamps, metadata |
| **label** | 14 | 500 (Medium) | 16 | Buttons, inputs, toggles |

### Scientific Name Styling

- **Font size**: 12pt (caption)
- **Weight**: 300 (Light)
- **Style**: Italic
- **Color**: textSecondary
- **Position**: Directly below common name

---

## 📐 Spacing System (8pt Grid)

**All measurements in multiples of 4 or 8 for consistency:**

```typescript
const spacing = {
  xxs: 4,   // 0.5x - Micro-spacing, internal icon separation
  xs: 8,    // 1x   - Small element spacing, icon/label gaps
  sm: 16,   // 2x   - Card padding, screen horizontal margins
  md: 24,   // 3x   - Section separation, content blocks
  lg: 32,   // 4x   - Large component margins, major spacing
  xl: 40,   // 5x   - Image containers, extra large gaps
  xxl: 48,  // 6x   - Touch target minimum (accessibility)
  xxxl: 64, // 8x   - Major section dividers
};
```

### Layout Guidelines

- **Screen horizontal padding**: 16dp (sm)
- **Card internal padding**: 16dp (sm)
- **Section vertical spacing**: 24dp (md)
- **Component separation**: 8-16dp (xs-sm)
- **Touch target minimum**: 48x48dp (xxl)

---

## 🎴 Component Specifications

### History Cards

**Design Structure:**
```
┌─────────────────────────────────────┐
│ ┌──────────┐  Common Name       ⭐  │ <- 16dp padding
│ │  Image   │  Scientific Name        │
│ │  1:1     │  📍 Location            │
│ │  Aspect  │  🕐 2 hours ago         │
│ └──────────┘  Confidence: ★★★★☆     │
│                                      │
│ [View Details]  [Re-identify]       │
└─────────────────────────────────────┘
```

**Specifications:**
- **Container**: 16dp padding, 8dp border radius
- **Image**: 1:1 aspect ratio (80x80dp thumbnail), 8dp border radius
- **Elevation**: Surface color with subtle shadow (dark mode: lighter surface)
- **Typography**: h3 for name, caption for metadata
- **Spacing**: 8dp between elements

### Confidence Score Badges

| Tier | Range | Badge Style | Color | Icon |
|------|-------|-------------|-------|------|
| **Confirmed** | 90%+ | Solid badge + checkmark | Success Green | ✓ |
| **High** | 80-89% | Solid badge | Primary Teal | - |
| **Medium** | 70-79% | Outlined badge | Warning Orange | ! |
| **Low** | <70% | Faded text | Secondary Gray | ? |

**Badge Design:**
- **Height**: 24dp
- **Padding**: 8dp horizontal, 4dp vertical
- **Border radius**: 12dp (pill shape)
- **Typography**: label (14pt, medium weight)

### Floating Action Button (FAB)

**Primary Identify Button:**
- **Size**: 56x56dp (circular) or extended with text
- **Color**: Accent (#FFB700 light / #FFD700 dark)
- **Icon**: Camera (24dp, white)
- **Position**: Bottom center, intersecting tab bar
- **Elevation**: 6dp shadow
- **Animation**: 150ms scale on press

**Extended FAB (First use):**
- **Width**: Auto (text + padding)
- **Height**: 48dp
- **Text**: "Identify Bird"
- **Icon + Label spacing**: 8dp

### Bottom Sheets / Modals

**Design:**
- **Backdrop**: 40-50% opacity black overlay
- **Surface**: Use theme surface color
- **Border radius**: 16dp top corners
- **Handle**: 4dp x 32dp rounded bar, centered, 12dp from top
- **Header**: Sticky, 56dp height, 16dp padding
- **Content**: 16dp horizontal padding, scrollable
- **Dismissal**: Swipe down, tap backdrop, close button (48x48dp)

---

## 🎭 Iconography

### Icon Library
**Primary**: Feather Icons or Ionicons
- **Style**: Outlined (stroke) with subtle rounded corners
- **Stroke weight**: 2px for consistency

### Icon Sizes
- **Small**: 16dp (inline with text)
- **Medium**: 24dp (standard UI icons)
- **Large**: 32dp (FAB, primary actions)
- **Touch target**: 48x48dp minimum (invisible wrapper)

### Custom Icons Needed
- Bird silhouettes (species categories)
- Audio waveform (sound ID)
- Camera variants
- Confidence indicators (star ratings)

---

## 🎬 Animation & Transitions

### Timing Standards

```typescript
const durations = {
  instant: 0,       // Reduced motion preference
  fast: 100,        // Micro-interactions, button feedback
  normal: 200,      // Standard interactions
  moderate: 300,    // Screen transitions, modals
  slow: 500,        // Complex animations, page loads
};

const easings = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'spring(1, 80, 10, 0)', // React Native Reanimated
};
```

### Key Animations

| Interaction | Duration | Easing | Description |
|-------------|----------|--------|-------------|
| Button press | 100ms | easeIn | Scale to 95% |
| Button release | 200ms | spring | Scale to 100% |
| Screen transition | 300ms | easeInOut | Slide animation |
| Modal open | 250ms | easeOut | Slide up from bottom |
| Card interaction | 200ms | easeInOut | Shadow + scale change |
| Loading spinner | 1000ms | linear | Continuous rotation |
| Success checkmark | 300ms | easeOut | Scale + fade in |

### Performance Requirements
- **Target**: 60fps for all animations
- **Hardware acceleration**: Use transform and opacity only
- **Reduced motion**: Provide instant alternatives
- **Battery consideration**: Simplify on low power mode

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

**Contrast Requirements:**
- Normal text (16pt): 4.5:1 minimum
- Large text (28pt): 3:1 minimum
- UI components: 3:1 minimum

**Touch Targets:**
- Minimum size: 48x48dp (xxl spacing token)
- Minimum separation: 8dp clear space

**Focus Indicators:**
- Visible focus ring: 2px solid accent color
- Offset: 2dp from element
- Always visible when focused

**Screen Reader Support:**
- All images: Descriptive alt text
- All buttons: Accessible labels
- All inputs: Associated labels
- Heading hierarchy: Proper semantic structure

**Additional Requirements:**
- Support text scaling up to 200%
- Respect reduced motion preferences
- Never rely solely on color to convey information
- Provide alternatives for audio-based features

---

## 🌓 Dark Mode Strategy

### Implementation Approach

**Why Deep Gray (#121212) over Pure Black (#000000)?**
1. **Elevation system works**: Lighter surfaces (#1E1E1E) create visual depth
2. **Reduces eye strain**: Less harsh contrast
3. **Photo vibrancy**: Images pop against dark gray
4. **Premium feel**: More sophisticated than pure black

**Color Adaptations:**
- **Images**: Maintain original colors, no filtering needed
- **Shadows**: Convert to elevation via lighter surfaces
- **Text**: Use near-white (#F5F5FF) not pure white
- **Brand elements**: Brighter variants of colors

**Technical Implementation:**
- React Native Appearance API for system detection
- AsyncStorage for user preference persistence
- Context Provider for theme state
- 300ms smooth transition between modes

---

## 📱 Platform Considerations

### iOS Specific
- Follow Human Interface Guidelines
- Use system native components when possible
- Respect safe areas (notches, home indicators)
- Support haptic feedback for interactions

### Android Specific
- Follow Material Design principles
- Support back button navigation
- Respect system navigation gestures
- Adaptive icons for launcher

### Cross-Platform
- Use platform-appropriate navigation patterns
- Respect system font scaling
- Support system sharing
- Follow platform animation conventions

---

## 🎯 Empty States

### Templates

**First Use (No History):**
- **Illustration**: Friendly bird with binoculars (line art, forest green)
- **Headline**: "Your Birding Journey Starts Now!"
- **Body**: "Your observations will appear here. Tap the Identify button below to find your first bird."
- **CTA**: Points to FAB with subtle animation

**Failed Identification:**
- **Illustration**: Bird with question mark
- **Headline**: "Couldn't identify this bird"
- **Body**: "Try a clearer photo or different angle. Some birds are tricky!"
- **CTAs**: [Try Again] [Manual Entry]

**No Network:**
- **Illustration**: Disconnected bird
- **Headline**: "You're offline"
- **Body**: "Connect to the internet to identify birds."
- **CTA**: [Retry]

---

## 🎮 Interaction Patterns

### Navigation
- **Bottom Tab Bar**: 3 tabs (Home, History, Settings)
- **Central FAB**: Primary identify action
- **Back Navigation**: Platform-appropriate (iOS swipe, Android back button)

### Gestures
- **Swipe to dismiss**: Modals, bottom sheets
- **Pull to refresh**: History list
- **Pinch to zoom**: Full-screen images
- **Long press**: Contextual menus (future)

### Feedback
- **Button press**: Visual scale + haptic (iOS)
- **Success**: Checkmark animation + subtle confetti
- **Error**: Shake animation + error message
- **Loading**: Custom bird animation or skeleton screens

---

## 📊 Implementation Priority

### Phase 1 - Foundation (Week 1-2)
- ✅ Create design tokens file (`src/theme/tokens.ts`)
- ✅ Implement theme provider with light/dark support
- ✅ Update color system across app
- ✅ Implement spacing system (8pt grid)
- ✅ Update typography scale

### Phase 2 - Core Components (Week 3-4)
- ✅ Redesign history cards with 1:1 images
- ✅ Implement confidence badge system
- ✅ Create FAB component
- ✅ Update bottom tab navigation
- ✅ Implement empty states

### Phase 3 - Polish & Delight (Week 5-6)
- ✅ Add micro-interactions and animations
- ✅ Implement loading states (skeletons)
- ✅ Add success/error feedback animations
- ✅ Create onboarding flow
- ✅ Implement accessibility features

### Phase 4 - Advanced Features (Week 7-8)
- ⏳ Add gamification elements
- ⏳ Implement expert mode toggle
- ⏳ Create statistics dashboard
- ⏳ Add social sharing features

---

## 🔧 Technical Stack

**React Native + Expo:**
- `react-native-reanimated`: High-performance animations
- `expo-haptics`: Haptic feedback (iOS)
- `expo-linear-gradient`: Gradient backgrounds
- `@react-navigation/native`: Navigation
- `react-native-svg`: Custom icons and illustrations

**State Management:**
- React Context for theme
- AsyncStorage for persistence
- Zustand/Jotai for app state (if needed)

**Performance:**
- Image optimization: Compress before upload
- Lazy loading: For history lists
- Memoization: Prevent unnecessary re-renders
- Native driver: For all animations

---

## 📚 Design Resources

**Tools Used:**
- Coolors.co - Color palette generation
- WebAIM Contrast Checker - Accessibility validation
- Feather Icons / Ionicons - Icon library
- Type Scale - Typography system
- Dribbble / Mobbin - Design inspiration

**Competitors Analyzed:**
- Merlin Bird ID
- iNaturalist
- eBird
- Birda
- Picture This (plant ID for reference)

---

## ✅ Success Metrics

**Design System Health:**
- 100% WCAG 2.1 AA compliance
- 60fps maintained for all animations
- <3s initial load time
- <1s screen transitions

**User Experience:**
- 90%+ identification success rate
- 4.5+ app store rating
- <5% user-reported UI issues
- Increased session duration

---

## 🎨 Summary

The Orniva Design System combines the best insights from both research reports:

1. **"Nature Noir" Design Language** - Deep, sophisticated dark mode with vibrant nature colors
2. **8pt Grid System** - Absolute consistency and scalability
3. **WCAG 2.1 AA Accessibility** - Universal access for all users
4. **Transparent AI Confidence** - Clear, color-coded tier system builds trust
5. **Premium Photography Display** - 1:1 aspect ratios, optimized for image quality
6. **Prominent FAB** - Immediate access to primary identify action
7. **Progressive Disclosure** - Simple by default, expert mode available

**This system is now ready for implementation! Let's build a world-class bird identification app! 🚀🐦**
