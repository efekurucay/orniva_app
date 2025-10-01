import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../components/Icon';
import { AppIcons } from '../constants/icons';
import { edgeFunctionService } from '../services/edgeFunctionService';
import { t, tv } from '../utils/i18n';
import { RootStackParamList } from '../types';

type AnalysisScreenRouteProp = RouteProp<RootStackParamList, 'Analysis'>;
type AnalysisScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Analysis'>;

// Retry configuration
const MAX_RETRY_ATTEMPTS = 2; // Will try up to 3 times total (initial + 2 retries)
const RETRY_DELAYS = [2000, 4000]; // Exponential backoff: 2s, 4s

export const AnalysisScreen: React.FC = () => {
  const route = useRoute<AnalysisScreenRouteProp>();
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const { user, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const { imageUri } = route.params;

  const [pulseAnim] = useState(new Animated.Value(1));
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start analysis
    analyzeBird();
  }, []);

  const analyzeBird = async (attemptNumber: number = 0) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: t('error', user?.language),
        text2: 'User not authenticated',
      });
      navigation.goBack();
      return;
    }

    try {
      // ✅ Credit deduction now handled in Edge Function (only after successful analysis)
      // Perform bird recognition via Edge Function (secure server-side)
      const result = await edgeFunctionService.identifyBird(imageUri, user.id, user.language || 'en');

      // Refresh user profile to update credits after successful analysis
      await refreshProfile();

      // Navigate to results
      navigation.replace('Results', {
        imageUri,
        result,
      });
    } catch (error: any) {
      console.error(`Analysis error (attempt ${attemptNumber + 1}):`, error);

      // Check if error is retryable and we haven't exceeded max attempts
      const isRetryable = error.retryable || 
        error.message?.includes('timeout') ||
        error.message?.includes('network') ||
        error.message?.includes('fetch') ||
        error.message?.includes('rate limit');
      
      const canRetry = isRetryable && attemptNumber < MAX_RETRY_ATTEMPTS;

      if (canRetry) {
        // Show retry notification
        const delayMs = RETRY_DELAYS[attemptNumber];
        const delaySeconds = Math.ceil(delayMs / 1000);
        
        setRetryCount(attemptNumber + 1);
        
        Toast.show({
          type: 'info',
          text1: t('retrying', user?.language),
          text2: tv('retryAttempt', user?.language, {
            seconds: delaySeconds,
            plural: delaySeconds > 1 ? 's' : '',
            current: attemptNumber + 2,
            total: MAX_RETRY_ATTEMPTS + 1,
          }),
          visibilityTime: delayMs,
        });

        // Wait and retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return analyzeBird(attemptNumber + 1);
      }

      // Max retries reached or non-retryable error - show error and go back
      let errorMessage = t('genericError', user.language);

      if (error.message?.includes('Insufficient credits')) {
        errorMessage = t('insufficientCredits', user.language);
      } else if (error.message?.includes('timeout')) {
        errorMessage = attemptNumber > 0 
          ? 'Request timeout after multiple attempts. Try with a smaller image.'
          : 'Request timeout. Please try again with a smaller image.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = attemptNumber > 0
          ? t('networkError', user.language) + ' Could not connect after retrying.'
          : t('networkError', user.language);
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: t('error', user.language),
        text2: errorMessage,
        visibilityTime: 4000,
      });

      // Wait a bit before navigating back so user can see the error
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Image Preview */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        {/* Loading Animation */}
        <Animated.View style={[styles.loadingContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Icon name={AppIcons.scan} size="xxl" color="primary" />
        </Animated.View>

        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('analyzing', user?.language)}
        </Text>
        <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
          {t('pleaseWait', user?.language)}
        </Text>

        {/* Retry Count Indicator */}
        {retryCount > 0 && (
          <Text style={[styles.retryText, { color: colors.warning }]}>
            ⚠️ Retrying... (Attempt {retryCount + 1}/{MAX_RETRY_ATTEMPTS + 1})
          </Text>
        )}

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginTop: 16,
  },
});
