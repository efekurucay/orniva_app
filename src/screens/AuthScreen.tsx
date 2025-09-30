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
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { t } from '../utils/i18n';

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
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
            <Text style={[styles.logo, { color: colors.primary }]}>🦜</Text>
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
              }}
              placeholder="••••••••"
              isPassword
              autoComplete="password"
              error={errors.password}
            />

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
    fontSize: 72,
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
});