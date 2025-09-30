# 🦜 Orniva - Find Birds

A modern, beautiful mobile application for bird identification using AI-powered image recognition with the Gemini API. Built with React Native, Expo, Supabase, and TypeScript.

## ✨ Features

- **🔐 Authentication**: Secure user authentication with Supabase
- **📸 Bird Recognition**: Real-time bird identification using Google's Gemini API
- **💳 Credit System**: Track analysis credits with real-time updates
- **🌓 Dark Mode**: Automatic theme switching with manual override
- **🌍 Multi-language**: Support for English and Turkish
- **🎨 Modern UI**: Clean, minimalist design with smooth animations
- **📱 Mobile-First**: Optimized for iOS and Android with platform-native behaviors

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo (TypeScript)
- **Backend**: Supabase (Authentication & Database)
- **AI**: Google Gemini API (Bird Recognition)
- **State Management**: React Context API
- **Navigation**: React Navigation v6
- **Styling**: React Native StyleSheet with theme system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio (for Android development)
- Expo Go app on your mobile device (for testing)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
cd orniva_app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The Supabase connection is already configured in `src/config/env.ts`.

**Important:** The Gemini API key is now configured **server-side** in Supabase Edge Functions for security. You do NOT need to add it to the client-side code.

For detailed Edge Function deployment and secret configuration, see:
- `EDGE_FUNCTION_DEPLOYMENT.md` - Complete deployment guide
- `supabase/functions/identify-bird/` - Edge Function source code

To configure the Gemini API key in Supabase:

```bash
# Set the secret in Supabase
supabase secrets set GEMINI_API_KEY=your_api_key_here

# Deploy the Edge Function
supabase functions deploy identify-bird
```

**Client-side configuration** (already set up):
```typescript
export const ENV = {
  SUPABASE_URL: 'https://coowimujsrlgrcifebhm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
} as const;
```

### 4. Database Setup

The database is already configured and running on Supabase with the following tables:

- **user_profiles**: Stores user data and credits
- **bird_analyses**: Tracks analysis history

The database includes:
- Row Level Security (RLS) policies
- Automatic profile creation on signup
- Credit management system

### 5. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your phone

## 📱 Running on Devices

### iOS (macOS only)

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Web

```bash
npm run web
```

## 🏗️ Project Structure

```
orniva_app/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── config/           # Configuration files
│   │   ├── env.ts
│   │   └── supabase.ts
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── screens/          # Application screens
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── AnalysisScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # API and business logic
│   │   ├── authService.ts
│   │   └── edgeFunctionService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
│       └── i18n.ts
├── App.tsx               # Root component
├── app.json              # Expo configuration
└── package.json          # Dependencies

```

## 🎯 Key Features Explained

### Authentication Flow

1. Users sign up or sign in with email/password
2. Supabase handles authentication and session management
3. User profiles are automatically created with 10 initial credits
4. Sessions persist across app restarts

### Bird Analysis Flow (Secure Edge Function Architecture)

1. User uploads a bird photo (camera or gallery)
2. Check if user has sufficient credits
3. Deduct 1 credit from user account
4. Convert image to base64 data URI (using modern Expo File API)
5. **Send to Supabase Edge Function** (secure server-side processing)
6. Edge Function calls Gemini API with API key stored in Supabase Secrets
7. Parse and display results
8. Update user's credit balance

**Security Benefits:**
- ✅ Gemini API key never exposed to client
- ✅ Server-side rate limiting and validation
- ✅ Cross-platform compatible (base64 data URIs work everywhere)

### Credit Management

- New users receive 10 credits
- Each analysis costs 1 credit
- Credits are deducted before analysis
- Real-time credit updates across all screens
- Transaction is atomic (all-or-nothing)

## 🎨 Customization

### Themes

Edit colors in `src/types/index.ts`:

```typescript
export const lightColors = {
  primary: '#4A90E2',      // Main brand color
  secondary: '#50C878',    // Accent color
  background: '#FFFFFF',   // Background
  // ... more colors
};
```

### Translations

Add or modify translations in `src/utils/i18n.ts`:

```typescript
export const translations = {
  en: {
    // English translations
  },
  tr: {
    // Turkish translations
  },
};
```

## 🔧 Troubleshooting

### Issue: "Edge Function error" or "API configuration error"

**Solution**: Make sure the Gemini API key is configured in Supabase Secrets:
```bash
supabase secrets set GEMINI_API_KEY=your_api_key_here
```
Then redeploy the Edge Function:
```bash
supabase functions deploy identify-bird
```

### Issue: "Insufficient credits"

**Solution**: The demo starts with 10 credits. For production, implement a credit purchase system or reset credits manually in Supabase dashboard.

### Issue: "Network Error"

**Solution**: 
- Check your internet connection
- Verify Gemini API key is valid
- Ensure Supabase URL is accessible

### Issue: Camera permissions

**Solution**: Grant camera and photo library permissions when prompted. On iOS, check Settings > Orniva. On Android, check App Settings > Permissions.

## 📊 Database Schema

### user_profiles

```sql
id            UUID (Primary Key, references auth.users)
email         TEXT
username      TEXT (nullable)
credits       INTEGER (default: 10)
language      TEXT (default: 'en')
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### bird_analyses

```sql
id            UUID (Primary Key)
user_id       UUID (Foreign Key -> auth.users)
bird_species  TEXT
confidence    NUMERIC(5,2)
description   TEXT
image_url     TEXT
created_at    TIMESTAMP
```

## 🔒 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Secure function execution with proper search paths
- ✅ **Gemini API key stored server-side in Supabase Secrets** (never exposed to client)
- ✅ Edge Function architecture prevents API key leakage
- ✅ Input validation on all forms
- ✅ Secure session management with AsyncStorage
- ✅ Base64 image transmission (no local file path vulnerabilities)

## 🚢 Deployment

### Building for Production

#### iOS

```bash
eas build --platform ios
```

#### Android

```bash
eas build --platform android
```

### Environment Variables

For production, use Expo's environment variable system:

1. Create `eas.json`
2. Add environment-specific configurations
3. Use `expo-constants` to access variables securely

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service
- **Google Gemini** for powerful AI capabilities
- **Expo** for the excellent React Native development experience

## 📞 Support

For issues or questions:
- Check the [Issues](https://github.com/your-repo/issues) page
- Contact: support@orniva.app

---

Built with ❤️ using React Native, Expo, Supabase, and Gemini AI