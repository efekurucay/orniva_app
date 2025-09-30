# Credit Purchase System - Implementation Guide

## Overview
Complete implementation of a credit purchase system for the Orniva bird identification app. This system allows users to purchase credits to use the AI-powered bird identification feature.

## 🎯 Features Implemented

### 1. **Credit Packages Configuration** (`src/config/creditPackages.ts`)
- 4 predefined credit packages:
  - **Starter**: 10 credits - $4.99 ($0.50/credit)
  - **Popular**: 50 credits - $19.99 ($0.40/credit) - Featured
  - **Pro**: 100 credits - $34.99 ($0.35/credit) - Featured
  - **Best Value**: 250 credits - $74.99 ($0.30/credit) - Featured
- Flexible pricing structure
- Badge system for highlighting featured packages

### 2. **Database Schema** (Migration: `create_purchases_table`)
**Purchases Table:**
- Tracks all credit purchases
- Fields: `user_id`, `package_id`, `credits_purchased`, `amount_paid`, `currency`, `payment_provider`, `transaction_id`, `status`
- Automatic timestamps
- Foreign key to user_profiles

**Database Function: `process_purchase`**
- Validates user exists
- Checks for duplicate transactions
- Atomically adds credits and records purchase
- Returns success/error status

### 3. **Purchase Service** (`src/services/purchaseService.ts`)
**Current Implementation:**
- **MOCK payment system** for development/testing
- Simulates 1.5s payment processing delay
- Generates unique transaction IDs
- Full purchase history tracking
- iOS restore purchases support

**Functions:**
- `initiatePurchase(userId, packageId)` - Start a credit purchase
- `getPurchaseHistory(userId)` - Fetch user's purchase history
- `restorePurchases(userId)` - Restore previous purchases (iOS)
- `isTransactionProcessed(transactionId)` - Check for duplicate transactions

**Production Integration Guide Included:**
- RevenueCat (recommended for React Native)
- Stripe
- Apple/Google In-App Purchases (IAP)

### 4. **Purchase Screen UI** (`src/screens/PurchaseScreen.tsx`)
**Features:**
- Beautiful credit package cards with gradient backgrounds
- Badge indicators (Most Popular, Best Value)
- Price per credit calculation
- Current balance display
- Toggle between packages and purchase history
- Loading states during purchases
- Success/error toast notifications
- iOS-only "Restore Purchases" button
- Development mode warning for mock payments

**Layout:**
- Clean, modern design matching app theme
- Dark/light mode support
- Smooth animations
- Responsive to different screen sizes

### 5. **Internationalization** (`src/utils/i18n.ts`)
**Added Translations (EN/TR):**
- `purchaseCredits` / `Kredi Satın Al`
- `buyCredits` / `Kredi Satın Al`
- `currentBalance` / `Mevcut Bakiye`
- `creditPackages` / `Kredi Paketleri`
- `mostPopular` / `En Popüler`
- `bestValue` / `En Avantajlı`
- `starter` / `Başlangıç`
- `pro` / `Profesyonel`
- `perCredit` / `kredi başına`
- `purchaseButton` / `Satın Al`
- `processing` / `İşleniyor...`
- `purchaseSuccess` / `Satın alma başarılı! {credits} kredi eklendi.`
- `purchaseFailed` / `Satın alma başarısız. Lütfen tekrar deneyin.`
- `restorePurchases` / `Satın Alınanları Geri Yükle`
- `restoreSuccess` / `{count} satın alma geri yüklendi`
- `restoreNone` / `Geri yüklenecek satın alma yok`
- `purchaseHistory` / `Satın Alma Geçmişi`
- `noPurchaseHistory` / `Henüz satın alma geçmişi yok`
- `transaction` / `İşlem`
- `date` / `Tarih`
- `amount` / `Tutar`
- `mockPaymentWarning` / `Deneme ödemesi (Geliştirme modu)`

### 6. **Navigation Integration**
**Routes Added:**
- `Purchase` screen added to `RootStackParamList`
- Bottom slide animation for purchase screen
- Import added to `App.tsx`

**Access Points:**
1. **HomeScreen**: Tap on credit card (shows "+" hint)
2. **SettingsScreen**: "💳 Buy Credits" button in profile section

### 7. **UI Enhancements**
**HomeScreen:**
- Credit card now clickable/tappable
- Visual "+" indicator for adding credits
- Smooth navigation to purchase screen

**SettingsScreen:**
- Prominent "Buy Credits" button below credit display
- Matches app's primary color theme
- Clear call-to-action

## 🔄 User Flow

1. **User views credits** on Home or Settings screen
2. **Taps credit card or "Buy Credits" button**
3. **Purchase screen opens** showing available packages
4. **User selects a package** (e.g., 50 credits for $19.99)
5. **Mock payment processes** (1.5s delay)
6. **Credits added atomically** via database function
7. **Success notification** shown with credit amount
8. **User balance updates** automatically
9. **Purchase recorded** in history (viewable in Purchase screen)

## 🧪 Testing in Development Mode

The current implementation uses **MOCK payments**:
- No real money is charged
- Simulates payment processing
- Always succeeds (for testing success path)
- Shows warning: "⚠️ Mock payment (Development mode)"
- Automatically refreshes user credits

**Testing Checklist:**
- ✅ Navigate to Purchase screen from Home
- ✅ Navigate to Purchase screen from Settings
- ✅ View all credit packages
- ✅ See featured badges
- ✅ Purchase a package (mock)
- ✅ Verify credits added
- ✅ Check purchase history
- ✅ Test restore purchases (iOS)
- ✅ Verify internationalization (EN/TR)
- ✅ Test in dark/light mode

## 🚀 Production Deployment Steps

### 1. **Choose Payment Provider**

#### Option A: RevenueCat (Recommended)
```bash
npm install react-native-purchases
```

**Benefits:**
- Handles iOS App Store & Google Play Store
- Server-side receipt validation
- Cross-platform purchase management
- Real-time purchase updates
- Built-in analytics

**Configuration:**
1. Create account at [revenuecat.com](https://www.revenuecat.com)
2. Configure products in RevenueCat dashboard
3. Add API keys to `.env`:
   ```
   REVENUECAT_API_KEY_IOS=rckt_xxx
   REVENUECAT_API_KEY_ANDROID=rckt_yyy
   ```
4. Update `purchaseService.ts` to use RevenueCat SDK

#### Option B: Stripe
```bash
npm install @stripe/stripe-react-native
```

**Benefits:**
- Works worldwide
- Credit card payments
- No app store fees (30%)
- More payment methods

**Configuration:**
1. Create Stripe account
2. Set up backend for payment intents
3. Implement webhook handling
4. Update service to use Stripe SDK

#### Option C: Native IAP (react-native-iap)
```bash
npm install react-native-iap
```

**Configuration:**
1. Configure products in App Store Connect & Google Play Console
2. Implement receipt validation server-side
3. Handle platform-specific logic

### 2. **Update Environment Variables**
Add to `.env`:
```env
# Payment Provider
PAYMENT_PROVIDER=REVENUECAT  # or STRIPE, or IAP
REVENUECAT_API_KEY_IOS=rckt_xxx
REVENUECAT_API_KEY_ANDROID=rckt_yyy
# or
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### 3. **Update Purchase Service**
Replace mock implementation in `src/services/purchaseService.ts`:

```typescript
// Example for RevenueCat
import Purchases from 'react-native-purchases';

export async function initiatePurchase(
  userId: string,
  packageId: string
): Promise<PurchaseResult> {
  try {
    const offerings = await Purchases.getOfferings();
    const package = offerings.current?.availablePackages.find(
      p => p.identifier === packageId
    );
    
    if (!package) throw new Error('Package not found');
    
    const { customerInfo } = await Purchases.purchasePackage(package);
    
    // Process via your backend webhook or directly
    await supabase.rpc('process_purchase', {
      user_id_param: userId,
      package_id_param: packageId,
      // ... other params from RevenueCat
    });
    
    return { success: true, credits: package.credits };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 4. **Test with Sandbox/Test Mode**
- **iOS**: Use App Store Connect Sandbox accounts
- **Android**: Use Google Play test tracks
- **Stripe**: Use test API keys

### 5. **Security Considerations**
- ✅ Never trust client-side purchase validation
- ✅ Always verify receipts server-side
- ✅ Use database functions for atomic credit updates
- ✅ Check for duplicate transactions
- ✅ Log all purchases for auditing
- ✅ Implement fraud detection
- ✅ Use HTTPS only

### 6. **App Store Configuration**
**iOS (App Store Connect):**
1. Create in-app purchase products matching package IDs
2. Set pricing tiers
3. Add descriptions and screenshots
4. Submit for review with app update

**Android (Google Play Console):**
1. Create products in Play Console
2. Set pricing
3. Add descriptions
4. Publish alongside app update

## 📊 Analytics & Monitoring

**Recommended Tracking:**
- Purchase attempts
- Purchase successes/failures
- Revenue by package
- Average purchase value
- Failed payment reasons
- Restore purchase usage
- Purchase history views

**Suggested Tools:**
- RevenueCat (built-in analytics)
- Mixpanel / Amplitude
- Firebase Analytics
- Custom Supabase analytics

## 🐛 Debugging & Troubleshooting

**Common Issues:**

1. **"Function not found" errors**
   - Run database migration
   - Check Supabase function exists
   - Verify user permissions

2. **Credits not updating**
   - Check network connectivity
   - Verify database function succeeds
   - Call `refreshProfile()` after purchase

3. **Duplicate purchases**
   - Transaction ID check in database
   - Use idempotency keys

4. **iOS restore not working**
   - Implement proper receipt validation
   - Check App Store Connect configuration

## 📝 Next Steps

### Immediate (Before Production):
- [ ] Choose and integrate real payment provider
- [ ] Test with sandbox/test accounts
- [ ] Implement server-side receipt validation
- [ ] Add purchase analytics
- [ ] Configure App Store / Play Store products
- [ ] Test on physical devices (iOS & Android)
- [ ] Add error handling for edge cases

### Future Enhancements:
- [ ] Promotional codes / discount system
- [ ] Subscription packages (monthly credits)
- [ ] Referral rewards (free credits)
- [ ] Purchase refunds system
- [ ] Bundle deals (e.g., holidays)
- [ ] Credits expiration policy
- [ ] Premium features (unlimited credits)
- [ ] Gift credits to other users

## 💡 Key Design Decisions

1. **Mock implementation first**: Allows UI/UX testing without payment provider setup
2. **Atomic database operations**: Prevents credit duplication bugs
3. **Transaction ID tracking**: Prevents duplicate purchases
4. **Internationalization**: Full EN/TR support from day one
5. **Dark mode support**: Consistent with app design
6. **Platform-specific features**: iOS restore purchases
7. **Clear pricing**: Show cost per credit
8. **Featured badges**: Guide users to best value

## 🔗 Related Files

- `src/config/creditPackages.ts` - Package definitions
- `src/services/purchaseService.ts` - Purchase logic
- `src/screens/PurchaseScreen.tsx` - UI
- `src/screens/HomeScreen.tsx` - Credit card tap
- `src/screens/SettingsScreen.tsx` - Buy button
- `src/utils/i18n.ts` - Translations
- `src/types/index.ts` - TypeScript types
- `supabase/migrations/xxx_create_purchases_table.sql` - Database schema

## 📞 Support

For issues or questions about the purchase system:
1. Check Supabase logs for database errors
2. Check Expo logs for client errors
3. Verify payment provider status
4. Review purchase history in database

---

**Status**: ✅ Complete (Development Mode)  
**Next**: 🚀 Production Integration  
**Version**: 1.0.0  
**Last Updated**: 2025-09-30