import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Icon } from '../components/Icon';
import { BirdIcon } from '../components/BirdIcon';
import { AppIcons } from '../constants/icons';
import { t } from '../utils/i18n';
import { validatePassword, validatePasswordForSignIn, getPasswordStrengthColor, PasswordValidationResult } from '../utils/passwordValidation';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, user } = useAuth();
  const { colors } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordValidationResult | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Validate password based on mode
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (isSignUp) {
      // Strict validation for sign up
      const validation = validatePassword(password);
      if (!validation.isValid) {
        newErrors.password = validation.errors[0]; // Show first error
        isValid = false;
      }
    } else {
      // Simple validation for sign in
      const validation = validatePasswordForSignIn(password);
      if (!validation.isValid) {
        newErrors.password = validation.error || 'Invalid password';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password, username.trim() || undefined);
        Toast.show({
          type: 'success',
          text1: t('success', user?.language),
          text2: t('signUpSuccess', user?.language),
        });
      } else {
        await signIn(email.trim(), password);
        Toast.show({
          type: 'success',
          text1: t('success', user?.language),
          text2: t('signInSuccess', user?.language),
        });
      }
    } catch (error: any) {
      let errorMessage = t('genericError', user?.language);
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = t('invalidCredentials', user?.language);
      } else if (error.message?.includes('already registered')) {
        errorMessage = t('emailInUse', user?.language);
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: t('error', user?.language),
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <BirdIcon size="xxl" style={styles.logo} />
            <Text style={[styles.title, { color: colors.text }]}>
              {t('welcome', user?.language)}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('inspirationalQuote', user?.language)}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t('email', user?.language)}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <Input
              label={t('password', user?.language)}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
                
                // Real-time password strength checking for sign up
                if (isSignUp && text.length > 0) {
                  const validation = validatePassword(text);
                  setPasswordStrength(validation);
                } else {
                  setPasswordStrength(null);
                }
              }}
              placeholder="••••••••"
              isPassword
              autoComplete="password"
              error={errors.password}
            />

            {/* Password Strength Indicator (only for sign up) */}
            {isSignUp && passwordStrength && password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthHeader}>
                  <Text style={[styles.strengthLabel, { color: colors.textSecondary }]}>
                    Password Strength:
                  </Text>
                  <View style={[
                    styles.strengthBadge,
                    { backgroundColor: getPasswordStrengthColor(passwordStrength.strength).backgroundColor }
                  ]}>
                    <Text style={[
                      styles.strengthText,
                      { color: getPasswordStrengthColor(passwordStrength.strength).color }
                    ]}>
                      {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                    </Text>
                  </View>
                </View>
                
                {/* Strength bar */}
                <View style={[styles.strengthBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.strengthBarFill,
                      {
                        width: `${passwordStrength.score}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength.strength).color,
                      },
                    ]}
                  />
                </View>
                
                {/* Requirements checklist (only show first error or success) */}
                {passwordStrength.errors.length > 0 && (
                  <Text style={[styles.strengthHint, { color: colors.error }]}>
                    • {passwordStrength.errors[0]}
                  </Text>
                )}
                {passwordStrength.isValid && (
                  <Text style={[styles.strengthHint, { color: colors.success }]}>
                    ✓ Password meets all requirements
                  </Text>
                )}
              </View>
            )}

            {isSignUp && (
              <Input
                label={t('username', user?.language)}
                value={username}
                onChangeText={setUsername}
                placeholder="John Doe"
                autoCapitalize="words"
              />
            )}

            <Button
              title={isSignUp ? t('signUp', user?.language) : t('signIn', user?.language)}
              onPress={handleAuth}
              loading={loading}
              style={styles.submitButton}
            />
          </View>

          {/* Toggle Sign In/Sign Up */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {isSignUp ? t('haveAccount', user?.language) : t('noAccount', user?.language)}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {isSignUp ? t('signIn', user?.language) : t('signUp', user?.language)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordStrength: {
    marginTop: -12,
    marginBottom: 20,
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  strengthHint: {
    fontSize: 11,
    lineHeight: 16,
  },
});
