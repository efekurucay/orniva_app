/**
 * Password validation utility
 * Provides comprehensive password strength checking
 */

export interface PasswordValidationResult {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

/**
 * Validate password with comprehensive checks
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - Optional: At least one special character for strong passwords
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 25;
    if (password.length >= 12) {
      score += 10; // Bonus for longer passwords
    }
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 20;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 20;
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 20;
  }

  // Check for special characters (bonus, not required)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 15;
    suggestions.push('Great! Your password includes special characters');
  } else {
    suggestions.push('Consider adding special characters (!@#$%^&*) for extra security');
  }

  // Check for common patterns (weak passwords)
  const commonPatterns = [
    /^[0-9]+$/,        // Only numbers
    /^[a-zA-Z]+$/,     // Only letters
    /^(.)\1+$/,        // Repeated characters (aaa, 111)
    /^(123|abc|password|qwerty)/i, // Common sequences
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 30);
    suggestions.push('Avoid common patterns like "123", "abc", or repeated characters');
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score >= 80) {
    strength = 'strong';
  } else if (score >= 60) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  // Add strength-based suggestions
  if (strength === 'weak') {
    suggestions.push('Consider making your password longer and more complex');
  } else if (strength === 'medium') {
    suggestions.push('Your password is decent, but could be stronger');
  }

  return {
    isValid: errors.length === 0,
    strength,
    score: Math.min(100, score),
    errors,
    suggestions,
  };
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): {
  color: string;
  backgroundColor: string;
} {
  switch (strength) {
    case 'strong':
      return { color: '#2ECC71', backgroundColor: 'rgba(46, 204, 113, 0.1)' };
    case 'medium':
      return { color: '#F39C12', backgroundColor: 'rgba(243, 156, 18, 0.1)' };
    case 'weak':
      return { color: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)' };
  }
}

/**
 * Simple validation for sign-in (less strict)
 * Only checks if password meets minimum requirements
 */
export function validatePasswordForSignIn(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password is too short' };
  }
  
  return { isValid: true };
}