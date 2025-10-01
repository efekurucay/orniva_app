# 📱 Icon System - Quick Reference

## 🎯 Basic Usage

```tsx
import { Icon } from '../components/Icon';
import { AppIcons } from '../constants/icons';

<Icon name={AppIcons.camera} size="md" color="primary" />
```

---

## 📐 Sizes

| Size | Pixels | Use Case |
|------|--------|----------|
| `xs` | 16px | Tiny indicators, badges |
| `sm` | 24px | List items, inline icons |
| `md` | 32px | **Default** - Buttons, headers |
| `lg` | 40px | Large buttons, features |
| `xl` | 48px | Hero sections, emphasis |
| `xxl` | 64px | Big splash screens, logos |

---

## 🎨 Colors

| Color | Theme Value | Use Case |
|-------|-------------|----------|
| `primary` | Purple (#8B5CF6) | Brand actions, main features |
| `secondary` | Light Purple (#A855F7) | Secondary actions |
| `text` | Adaptive | Body text color |
| `textSecondary` | Adaptive | Muted text |
| `success` | Green | Success states, confirmations |
| `error` | Red | Errors, warnings |
| `warning` | Orange | Warnings, alerts |
| `white` | #FFFFFF | Light backgrounds |
| `black` | #000000 | Dark backgrounds |

Or use any hex color: `color="#FF0000"`

---

## 🔥 Most Used Icons

```tsx
// Navigation
<Icon name={AppIcons.back} />
<Icon name={AppIcons.home} />
<Icon name={AppIcons.settings} />
<Icon name={AppIcons.history} />

// Actions
<Icon name={AppIcons.camera} />
<Icon name={AppIcons.image} />
<Icon name={AppIcons.search} />
<Icon name={AppIcons.scan} />

// Birds & Nature
<Icon name={AppIcons.bird} />

// Status
<Icon name={AppIcons.checkmarkCircle} />
<Icon name={AppIcons.warning} />
<Icon name={AppIcons.error} />

// Account
<Icon name={AppIcons.person} />
<Icon name={AppIcons.logout} />
<Icon name={AppIcons.wallet} />
```

---

## 💡 Common Patterns

### Icon Button
```tsx
<TouchableOpacity onPress={handlePress}>
  <Icon name={AppIcons.camera} size="lg" color="primary" />
</TouchableOpacity>
```

### Icon with Text
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
  <Icon name={AppIcons.camera} size="md" color="text" />
  <Text>Take Photo</Text>
</View>
```

### Animated Icon
```tsx
<Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
  <Icon name={AppIcons.scan} size="xxl" color="primary" />
</Animated.View>
```

### Icon in Header
```tsx
<TouchableOpacity 
  style={styles.headerButton}
  onPress={() => navigation.navigate('Settings')}
>
  <Icon name={AppIcons.settings} size="md" color="text" />
</TouchableOpacity>
```

---

## 📚 All Available Icons (50+)

### Navigation & Actions
- `back`, `close`, `menu`, `more`

### Bird & Nature
- `bird`, `search`, `scan`, `eye`

### Camera & Media
- `camera`, `image`, `images`, `gallery`

### User & Account
- `person`, `logout`, `login`, `deleteAccount`

### Settings & Preferences
- `settings`, `language`, `theme`, `themeSun`

### Shopping & Credits
- `card`, `wallet`, `cash`, `cart`

### Information & Status
- `info`, `help`, `warning`, `alert`, `success`, `error`

### Navigation Tabs
- `home`, `history`, `stats`

### Actions
- `add`, `edit`, `delete`, `share`, `download`

### Confidence & Quality
- `checkmark`, `checkmarkCircle`, `star`, `starFilled`, `heart`, `heartFilled`

### UI Elements
- `chevronRight`, `chevronLeft`, `chevronUp`, `chevronDown`

### Zoom & View
- `zoomIn`, `zoomOut`, `expand`

### Time & Date
- `clock`, `calendar`

### Location
- `location`, `map`

### Communication
- `mail`, `notification`

### Data & Files
- `document`, `folder`, `cloud`

### Special
- `sparkle`, `sparkles`, `rocket`, `trophy`

---

## ⚡ Pro Tips

1. **Always use `AppIcons` constants** - Never hardcode icon names
2. **Prefer semantic colors** - Use `primary`, `text`, etc. over hex values
3. **Use appropriate sizes** - `md` for most cases, `xxl` for heroes
4. **Add custom style for spacing** - `style={{ marginRight: 8 }}`
5. **Check light/dark mode** - All colors adapt automatically

---

## 🚫 Don't Do This

```tsx
// ❌ Bad - Hardcoded icon name
<Icon name="camera-outline" />

// ❌ Bad - Wrong size type
<Icon name={AppIcons.camera} size="32" />

// ❌ Bad - Inconsistent colors
<Icon name={AppIcons.camera} color="#8B5CF6" />
```

## ✅ Do This Instead

```tsx
// ✅ Good - Use constant
<Icon name={AppIcons.camera} />

// ✅ Good - Use size preset
<Icon name={AppIcons.camera} size="lg" />

// ✅ Good - Use theme color
<Icon name={AppIcons.camera} color="primary" />
```

---

## 📖 Full Documentation

For complete details, see:
- `ICON_MODERNIZATION_COMPLETE.md` - Full technical docs
- `ICON_UPDATES_DEPLOYMENT_SUMMARY.md` - Deployment guide
- `src/constants/icons.ts` - All icon definitions
- `src/components/Icon.tsx` - Component implementation

---

**Happy coding! 🎉**
