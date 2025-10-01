#!/usr/bin/env node

/**
 * Reset Onboarding Script
 * 
 * This script helps you reset the onboarding state for testing.
 * Run this when you want to see the onboarding screen again.
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function resetOnboarding() {
  try {
    console.log('🔄 Resetting onboarding state...');
    
    // Remove the onboarding completion flag
    await AsyncStorage.removeItem('@onboarding_completed');
    
    console.log('✅ Onboarding state reset successfully!');
    console.log('📱 The onboarding will show again on next app launch.');
    console.log('\n💡 Tip: Restart your app to see the onboarding screen.');
  } catch (error) {
    console.error('❌ Error resetting onboarding:', error);
  }
}

// Run the reset
resetOnboarding();
