/**
 * Credit Package Configuration
 * Defines available credit packages for purchase
 */

export interface CreditPackage {
  id: string;
  credits: number;
  price: number; // in USD
  popular?: boolean;
  badge?: string;
  savings?: string;
  pricePerCredit: number;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'credits_10',
    credits: 10,
    price: 0.99,
    pricePerCredit: 0.099,
    badge: 'Starter',
  },
  {
    id: 'credits_50',
    credits: 50,
    price: 3.99,
    pricePerCredit: 0.080,
    badge: 'Popular',
    popular: true,
    savings: 'Save 20%',
  },
  {
    id: 'credits_100',
    credits: 100,
    price: 6.99,
    pricePerCredit: 0.070,
    badge: 'Best Value',
    savings: 'Save 30%',
  },
  {
    id: 'credits_250',
    credits: 250,
    price: 14.99,
    pricePerCredit: 0.060,
    badge: 'Pro',
    savings: 'Save 40%',
  },
];

/**
 * Get package by ID
 */
export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === id);
}

/**
 * Format price based on locale
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Calculate savings percentage
 */
export function calculateSavings(packagePrice: number, basePrice: number): number {
  return Math.round(((basePrice - packagePrice) / basePrice) * 100);
}