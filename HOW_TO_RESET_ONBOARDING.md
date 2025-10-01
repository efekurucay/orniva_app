# 🔄 How to See the Onboarding Screen Again

## ❓ Why Did the Onboarding Disappear?

The onboarding screen only shows **once** when you first create an account. After you complete it (by tapping "Get Started"), it's marked as complete and won't show again.

This is stored in AsyncStorage using the key: `@onboarding_completed`

---

## ✅ **Method 1: Use the Built-in Reset (Easiest)**

I've added a **Developer Options** section to your Settings screen that only appears in development mode.

### Steps:
1. **Open the app** in development mode
2. **Go to Settings** (gear icon in top right)
3. **Scroll down** to "Developer Options" section
4. **Tap "Reset Onboarding"**
5. **Confirm** the reset
6. **Restart the app** (close and reopen)
7. ✅ Onboarding will show again!

### Screenshot of what you'll see:
```
┌─────────────────────────────┐
│  Developer Options          │
│                             │
│  🔄  Reset Onboarding       │
│                             │
│  💡 This option is only     │
│     visible in development  │
│     mode                    │
└─────────────────────────────┘
```

---

## 📱 **Method 2: Clear AsyncStorage Manually**

If you want to clear it from code:

### In React Native:
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear onboarding
await AsyncStorage.removeItem('@onboarding_completed');

// Then restart the app
```

### Using Chrome DevTools (Expo):
1. Open the app in Expo
2. Press `j` in terminal to open debugger
3. In Chrome DevTools Console:
```javascript
AsyncStorage.removeItem('@onboarding_completed');
```
4. Restart the app

---

## 🗑️ **Method 3: Delete and Re-create Account**

This will also reset onboarding (and everything else):

1. **Delete your account** via Settings → Delete Account
2. **Sign up again** with a new email
3. ✅ Onboarding will show for the new account

**Note**: This deletes all your data! Only use for testing.

---

## 🧪 **Method 4: Clear All App Data**

### On iOS Simulator:
```bash
# In terminal
xcrun simctl uninstall booted com.yourcompany.orniva
# Then reinstall the app
```

### On Android Emulator:
```bash
# In terminal
adb uninstall com.yourcompany.orniva
# Then reinstall the app
```

### On Physical Device:
- **iOS**: Long press app icon → Remove App → Delete App
- **Android**: Settings → Apps → Orniva → Storage → Clear Data

Then reinstall the app.

---

## 🎯 **How Onboarding Works**

### Code Flow:
```tsx
// App.tsx checks onboarding status
const [onboardingComplete, setOnboardingComplete] = useState(null);

// Check AsyncStorage
const completed = await AsyncStorage.getItem('@onboarding_completed');

// If user is authenticated AND hasn't seen onboarding
if (user && !onboardingComplete) {
  return <OnboardingScreen onComplete={handleOnboardingComplete} />;
}
```

### When Onboarding Completes:
```tsx
// OnboardingScreen.tsx
const handleComplete = async () => {
  // Save completion flag
  await AsyncStorage.setItem('@onboarding_completed', 'true');
  
  // Navigate to main app
  onComplete();
};
```

---

## 🔍 **Troubleshooting**

### Onboarding Still Won't Show?

**Check 1: Are you authenticated?**
- Onboarding only shows for **logged-in users**
- If you're not logged in, you'll see the Auth screen instead

**Check 2: Is AsyncStorage cleared?**
```tsx
// Check in code
const value = await AsyncStorage.getItem('@onboarding_completed');
console.log('Onboarding status:', value); // Should be null
```

**Check 3: Did you restart the app?**
- AsyncStorage check happens on app launch
- You MUST restart after clearing

**Check 4: Are you in dev mode?**
- The "Developer Options" section only shows when `__DEV__` is true
- Make sure you're running: `npm start` or `npx expo start`

---

## 💡 **Pro Tips**

### For Testing Onboarding Changes:
1. Make changes to `OnboardingScreen.tsx`
2. Use Settings → Reset Onboarding
3. Restart app (fast refresh won't work)
4. Test your changes

### For Production:
- The Developer Options section **won't appear** in production builds
- Users can't accidentally reset onboarding
- Onboarding only shows once per account

---

## 📁 **Related Files**

- **`App.tsx`** - Onboarding logic and routing
- **`src/screens/OnboardingScreen.tsx`** - Onboarding UI and slides
- **`src/screens/SettingsScreen.tsx`** - Reset button (dev mode)

---

## ✨ **Summary**

**Quickest Way:**
1. Go to Settings
2. Scroll to "Developer Options"
3. Tap "Reset Onboarding"
4. Restart the app

**That's it!** 🎉

---

**Need help?** The onboarding screen shows these 4 slides:
1. 🦜 Welcome to Orniva
2. 📸 Snap a Photo
3. 💰 Credits System (3 free credits)
4. ✨ Start Your Journey

All icons have been updated to professional Ionicons! 🎨
