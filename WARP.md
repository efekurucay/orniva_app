# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 🦜 Project Overview

Orniva is a React Native mobile application for bird identification using Google's Gemini AI API. Built with Expo, TypeScript, Supabase (PostgreSQL, Auth, Edge Functions), and React Navigation.

**Key Features:**
- AI-powered bird recognition via Gemini API
- Credit-based analysis system (10 free credits per user)
- Secure server-side API key management via Edge Functions
- Multi-language support (English, Turkish)
- Dark/light theme with system preference detection

## 🏗️ Architecture

### Application Structure
```
orniva_app/
├── src/
│   ├── components/     # Reusable UI (Button, Input)
│   ├── config/         # Supabase client & env config
│   ├── contexts/       # AuthContext, ThemeContext (React Context API)
│   ├── screens/        # Main screens (Auth, Home, Analysis, Results, Settings)
│   ├── services/       # Business logic (authService, edgeFunctionService)
│   ├── types/          # TypeScript interfaces & theme colors
│   └── utils/          # i18n translations, imageUtils
├── supabase/
│   ├── functions/      # Edge Functions (identify-bird)
│   ├── config.toml     # Supabase local config
│   └── seed.sql        # Database seed data
├── App.tsx             # Root component with navigation
└── index.ts            # Entry point
```

### Data Flow Architecture

**Authentication Flow:**
1. User signs up/in via `AuthScreen` → `AuthContext.signIn/signUp`
2. `authService` handles Supabase Auth API calls
3. User profile automatically created via database trigger (10 initial credits)
4. Session persists in AsyncStorage across app restarts
5. `AuthContext` provides global auth state via React Context

**Bird Analysis Flow (Secure Edge Function Pattern):**
1. User selects/captures image in `HomeScreen`
2. Navigate to `AnalysisScreen` with imageUri
3. Convert image to base64 data URI (cross-platform compatibility)
4. Call `edgeFunctionService.identifyBird()`
5. **Edge Function** (`supabase/functions/identify-bird/index.ts`):
   - Validates user credits (optimistic check)
   - Processes image (data URI, HTTP URL, or base64)
   - Calls Gemini API with server-side API key
   - Parses response (species, confidence, description)
   - Deducts 1 credit atomically via PostgreSQL function
6. Display results in `ResultsScreen`
7. `AuthContext.refreshProfile()` updates credit balance

**Why Edge Functions?**
- ✅ API keys never exposed to client
- ✅ Server-side validation & rate limiting
- ✅ Cross-platform image handling (base64 data URIs)
- ✅ Atomic credit deduction with database transactions

### Theme System

**Implementation:**
- `ThemeContext` wraps entire app, provides `isDark`, `colors`, `toggleTheme()`
- System preference detection via `useColorScheme()` hook
- Manual override persisted to AsyncStorage
- Color schemes defined in `src/types/index.ts` (lightColors, darkColors)
- All components consume theme via `useTheme()` hook

**Pattern:**
```typescript
const { colors, isDark } = useTheme();
// Use colors.primary, colors.background, etc.
```

### Navigation Structure

Uses React Navigation v6 with conditional rendering based on auth state:

**Unauthenticated:** `Auth` screen only  
**Authenticated:** `Home` → `Analysis` → `Results` (with `Settings` accessible from Home)

Stack navigator handles screen transitions with platform-native animations.

## 📦 Essential Commands

### Development
```bash
# Start Expo dev server (choose platform with i/a/w)
npm start

# Run on specific platform directly
npm run ios        # macOS only, requires Xcode
npm run android    # Requires Android Studio/emulator
npm run web        # Web browser

# Install dependencies after pulling changes
npm install
```

### Supabase Local Development

**Initial Setup:**
```bash
# Start Supabase services locally (PostgreSQL, Studio, Edge Functions)
supabase start

# Get local API keys
supabase status

# Stop local Supabase
supabase stop
```

**Edge Functions:**
```bash
# Create local env file with GEMINI_API_KEY
cp supabase/.env.local.example supabase/.env.local
# Edit supabase/.env.local and add: GEMINI_API_KEY=your_key_here

# Serve Edge Functions locally (with hot reload)
supabase functions serve --env-file supabase/.env.local

# Deploy Edge Function to production
supabase functions deploy identify-bird

# View Edge Function logs (production, real-time)
supabase functions logs identify-bird --tail

# Test Edge Function locally
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/identify-bird' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"imageUri":"data:image/jpeg;base64,...","user_id":"test-uuid"}'
```

**Database:**
```bash
# Generate TypeScript types from database schema
supabase gen types typescript --local > src/types/database.ts

# Create new migration
supabase migration new migration_name

# Apply migrations locally
supabase db reset

# Push migrations to production
supabase db push
```

**Secrets Management:**
```bash
# Set production secret (NEVER commit to git)
supabase secrets set GEMINI_API_KEY=your_production_key

# List secrets (values hidden)
supabase secrets list

# Remove secret
supabase secrets unset GEMINI_API_KEY
```

### TypeScript

Project uses strict TypeScript with Expo's base configuration:
```bash
# Type checking is automatic during development
# To manually check types:
npx tsc --noEmit
```

## 🔧 Development Patterns

### State Management
- **Global State:** React Context API (AuthContext, ThemeContext)
- **Local State:** useState for component-specific state
- **Session Persistence:** AsyncStorage for theme preference and auth sessions
- **Real-time Updates:** Supabase auth state listener in AuthContext

### Making API Calls

**Authentication:**
```typescript
import { useAuth } from '../contexts/AuthContext';

const { user, signIn, signOut, refreshProfile } = useAuth();

// Sign in
await signIn(email, password);

// Update credits after analysis
await refreshProfile();
```

**Bird Analysis:**
```typescript
import { edgeFunctionService } from '../services/edgeFunctionService';
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();
const result = await edgeFunctionService.identifyBird(imageUri, user.id);
// Returns: { species, confidence, description }
```

### Image Handling

**Best Practice:** Convert all images to base64 data URIs for cross-platform compatibility:

```typescript
import * as FileSystem from 'expo-file-system';

// Convert file URI to base64 data URI
const base64 = await FileSystem.readAsStringAsync(imageUri, {
  encoding: FileSystem.EncodingType.Base64,
});
const dataUri = `data:image/jpeg;base64,${base64}`;

// Send dataUri to Edge Function
```

**Why base64 data URIs?**
- Works on iOS, Android, and web
- No file path vulnerabilities
- Edge Functions can process directly without file system access

### Error Handling

Edge Functions return structured errors:
```typescript
try {
  const result = await edgeFunctionService.identifyBird(imageUri, userId);
} catch (error: any) {
  if (error.message.includes('Insufficient credits')) {
    // Show credit purchase dialog
  } else if (error.retryable) {
    // Show retry button
  } else {
    // Show generic error
  }
}
```

### Adding New Screens

1. Create screen component in `src/screens/NewScreen.tsx`
2. Add route type to `RootStackParamList` in `src/types/index.ts`:
   ```typescript
   export type RootStackParamList = {
     // ... existing routes
     NewScreen: { param1: string }; // Add params if needed
   };
   ```
3. Register screen in `App.tsx`:
   ```typescript
   <Stack.Screen name="NewScreen" component={NewScreen} />
   ```
4. Navigate from other screens:
   ```typescript
   navigation.navigate('NewScreen', { param1: 'value' });
   ```

### Adding Translations

Edit `src/utils/i18n.ts`:
```typescript
export const translations = {
  en: {
    newKey: 'English text',
  },
  tr: {
    newKey: 'Turkish text',
  },
};
```

Usage:
```typescript
import { useTranslation } from '../utils/i18n';

const t = useTranslation();
return <Text>{t('newKey')}</Text>;
```

## 🗄️ Database Schema

**Tables:**

`user_profiles` (public schema, RLS enabled):
- `id` (uuid, FK to auth.users) - Primary key
- `email` (text) - User email
- `username` (text, nullable) - Display name
- `credits` (integer, default: 10) - Analysis credits
- `language` ('en' | 'tr', default: 'en') - UI language
- `created_at`, `updated_at` (timestamp)

`bird_analyses` (public schema, RLS enabled):
- `id` (uuid) - Primary key
- `user_id` (uuid, FK to auth.users) - Owner
- `bird_species` (text) - Identified species
- `confidence` (numeric 0-100) - AI confidence %
- `description` (text, nullable) - Bird description
- `image_url` (text, nullable) - Image reference
- `created_at` (timestamp)

**PostgreSQL Functions:**
- `deduct_user_credit(user_id_param uuid)` - Atomically deducts 1 credit, returns success/error
- Trigger: `create_user_profile_on_signup()` - Auto-creates profile with 10 credits on auth signup

**RLS Policies:**
- Users can only read/update their own `user_profiles`
- Users can only read their own `bird_analyses`

## 🔒 Security Practices

- **Never commit secrets:** Use `.env.local` for local dev, Supabase Secrets for production
- **Edge Functions for sensitive operations:** API keys stay server-side only
- **RLS enabled:** All tables have Row Level Security policies
- **Atomic transactions:** Credit deduction uses PostgreSQL functions to prevent race conditions
- **Image validation:** Client validates images before upload (size, format)
- **Session management:** Auto-refresh tokens, secure storage with AsyncStorage

## 🧪 Testing Checklist

When testing features:

1. **Test both themes:** Toggle dark/light mode
2. **Test both languages:** Switch between English and Turkish in Settings
3. **Test auth flow:** Sign up → sign in → sign out
4. **Test credit system:** Analyze birds until credits run out
5. **Test offline behavior:** Disable network, check error handling
6. **Test image sources:** Camera, photo library, different formats
7. **Test on both platforms:** iOS and Android have different behaviors (if possible)

## 📱 Platform-Specific Notes

**iOS:**
- Camera/photo permissions must be granted
- Requires Xcode and macOS to build
- Test in iOS Simulator or Expo Go app

**Android:**
- Permissions handled via `app.json`
- Test in Android Emulator or Expo Go app
- Edge-to-edge mode enabled (new Android architecture)

**Web:**
- Camera API limited in browsers
- File uploads work, camera capture may not
- Test image upload functionality

## 🚀 Deployment

**Production Build:**
```bash
# Requires EAS (Expo Application Services)
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

**Before deploying:**
1. Update version in `app.json`
2. Test on physical devices
3. Ensure Edge Functions are deployed
4. Verify production secrets are set
5. Test production Supabase connection

## 🐛 Common Issues

**"Insufficient credits" on new user:**
- Check `user_profiles` table for credit value
- Verify `create_user_profile_on_signup` trigger is working
- Check PostgreSQL logs for errors

**"Edge Function error":**
- Verify `GEMINI_API_KEY` is set in Supabase Secrets
- Check Edge Function logs: `supabase functions logs identify-bird --tail`
- Ensure Edge Function is deployed: `supabase functions list`

**"Network Error" in development:**
- Local Supabase must be running: `supabase start`
- Check `src/config/env.ts` has correct local URL
- Verify Edge Functions are served: `supabase functions serve`

**TypeScript errors:**
- Ensure dependencies are installed: `npm install`
- Check `tsconfig.json` extends `expo/tsconfig.base`
- Clear Metro cache: `npx expo start --clear`

**Image upload fails:**
- Check image size (< 10MB recommended)
- Verify image is converted to base64 data URI
- Test with different image sources (camera vs library)

## 📚 Key Dependencies

- **expo** (~54.0): React Native framework
- **@supabase/supabase-js** (^2.58): Backend client
- **@react-navigation/native** (^7.1): Navigation system
- **expo-image-picker** (^17.0): Camera/gallery access
- **@google/generative-ai** (0.21.0): Gemini AI SDK (Edge Functions only)

## 🔗 External Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/coowimujsrlgrcifebhm
- **Gemini API Docs:** https://ai.google.dev/docs
- **Expo Docs:** https://docs.expo.dev/
- **React Navigation Docs:** https://reactnavigation.org/