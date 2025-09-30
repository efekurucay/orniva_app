/**
 * Purchase Service
 * Handles credit purchase flow
 * 
 * NOTE: This is a MOCK implementation for development/testing.
 * In production, replace with actual payment provider (RevenueCat, Stripe, etc.)
 */

import { supabase } from '../config/supabase';
import { CreditPackage } from '../config/creditPackages';

export interface PurchaseResult {
  success: boolean;
  credits?: number;
  transactionId?: string;
  error?: string;
}

export interface PurchaseRecord {
  id: string;
  package_id: string;
  credits: number;
  amount: number;
  currency: string;
  paymentProvider: string;
  transactionId: string;
  status: string;
  purchaseDate: string;
}

export interface PurchaseHistory {
  id: string;
  package_id: string;
  credits_purchased: number;
  amount_paid: number;
  currency: string;
  payment_provider: string;
  transaction_id: string;
  status: string;
  created_at: string;
}

/**
 * Initiate a credit purchase
 * MOCK: Simulates successful payment
 */
export async function initiatePurchase(
  userId: string,
  packageId: string
): Promise<PurchaseResult> {
  try {
    // Find the package
    const { CREDIT_PACKAGES } = await import('../config/creditPackages');
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    
    if (!creditPackage) {
      throw new Error('Package not found');
    }

    // MOCK: Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // MOCK: Generate fake transaction ID
    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Process purchase via Supabase database function
    const { data, error } = await supabase.rpc('process_purchase', {
      user_id_param: userId,
      package_id_param: creditPackage.id,
      credits_param: creditPackage.credits,
      amount_param: creditPackage.price,
      currency_param: 'USD',
      provider_param: 'MOCK_PROVIDER',
      transaction_id_param: transactionId,
    });

    if (error) {
      console.error('Purchase processing error:', error);
      throw new Error(error.message || 'Failed to process purchase');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Purchase processing failed');
    }

    return {
      success: true,
      credits: data.credits,
      transactionId,
    };
  } catch (error: any) {
    console.error('Purchase error:', error);
    return {
      success: false,
      error: error.message || 'Purchase failed. Please try again.',
    };
  }
}

/**
 * Get purchase history for a user
 */
export async function getPurchaseHistory(userId: string): Promise<PurchaseRecord[]> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }

    // Map database records to PurchaseRecord format
    return (data || []).map(record => ({
      id: record.id,
      package_id: record.package_id,
      credits: record.credits_purchased,
      amount: record.amount_paid,
      currency: record.currency,
      paymentProvider: record.payment_provider,
      transactionId: record.transaction_id,
      status: record.status,
      purchaseDate: record.created_at,
    }));
  } catch (error) {
    console.error('Failed to load purchase history:', error);
    return [];
  }
}

/**
 * Restore purchases (iOS requirement)
 * MOCK: In production, this would sync with App Store/Play Store
 */
export async function restorePurchases(userId: string): Promise<{ restored: number; credits: number }> {
  try {
    // MOCK: Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would:
    // 1. Query Apple/Google for user's purchase history
    // 2. Check against our database
    // 3. Process any missing purchases

    // For now, just return 0 restored
    return {
      restored: 0,
      credits: 0,
    };
  } catch (error) {
    console.error('Restore purchases error:', error);
    throw new Error('Failed to restore purchases');
  }
}

/**
 * Check if a transaction has already been processed
 */
export async function isTransactionProcessed(transactionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('transaction_id', transactionId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking transaction:', error);
    return false;
  }
}

/**
 * Legacy service object for backward compatibility
 */
export const purchaseService = {
  purchaseCredits: initiatePurchase,
  getPurchaseHistory,
  restorePurchases,
  isTransactionProcessed,
};

/**
 * PRODUCTION INTEGRATION GUIDE:
 * 
 * To integrate with real payment providers:
 * 
 * 1. RevenueCat (Recommended for React Native):
 *    - Install: npm install react-native-purchases
 *    - Configure products in RevenueCat dashboard
 *    - Replace purchaseCredits with:
 *      ```
 *      import Purchases from 'react-native-purchases';
 *      const purchase = await Purchases.purchasePackage(package);
 *      ```
 * 
 * 2. Stripe:
 *    - Install: npm install @stripe/stripe-react-native
 *    - Create payment intents via your backend
 *    - Process payments and webhook handling
 * 
 * 3. Apple/Google In-App Purchases:
 *    - iOS: Use StoreKit via react-native-iap
 *    - Android: Use Google Play Billing via react-native-iap
 *    - Verify receipts server-side for security
 */