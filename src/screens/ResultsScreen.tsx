import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { AppIcons } from '../constants/icons';
import { t } from '../utils/i18n';
import { RootStackParamList } from '../types';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;
type ResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;

export const ResultsScreen: React.FC = () => {
  const route = useRoute<ResultsScreenRouteProp>();
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { imageUri, result } = route.params;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Success animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return colors.success;
    if (confidence >= 50) return colors.warning;
    return colors.error;
  };

  const handleAnalyzeAnother = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <Animated.View style={[styles.successIcon, { opacity: fadeAnim }]}>
          <Icon name={AppIcons.checkmarkCircle} size="xxl" color="success" />
        </Animated.View>

        {/* Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            { backgroundColor: colors.surface },
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Image source={{ uri: imageUri }} style={styles.image} />
        </Animated.View>

        {/* Results Card */}
        <Animated.View
          style={[
            styles.resultsCard,
            { backgroundColor: colors.cardBackground },
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Species */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('birdSpecies', user?.language)}
            </Text>
            <Text style={[styles.speciesName, { color: colors.text }]}>{result.species}</Text>
          </View>

          {/* Confidence */}
          <View style={[styles.section, styles.confidenceSection]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('confidence', user?.language)}
            </Text>
            <View style={styles.confidenceContainer}>
              <View style={[styles.confidenceBar, { backgroundColor: colors.surface }]}>
                <LinearGradient
                  colors={[getConfidenceColor(result.confidence), getConfidenceColor(result.confidence)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.confidenceFill, { width: `${result.confidence}%` }]}
                />
              </View>
              <Text
                style={[
                  styles.confidenceText,
                  { color: getConfidenceColor(result.confidence) },
                ]}
              >
                {result.confidence}%
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('description', user?.language)}
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>{result.description}</Text>
          </View>

          {/* Credits Remaining */}
          <View style={[styles.creditsInfo, { backgroundColor: colors.surface }]}>
            <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
              {t('credits', user?.language)} {t('remaining', user?.language).toLowerCase()}:{' '}
              <Text style={[styles.creditsBold, { color: colors.primary }]}>{user?.credits || 0}</Text>
            </Text>
          </View>
        </Animated.View>

        {/* Action Button */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Button
            title={t('analyzeAnother', user?.language)}
            onPress={handleAnalyzeAnother}
            variant="primary"
            style={styles.analyzeButton}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  successIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
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
  resultsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  speciesName: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
  },
  confidenceSection: {
    marginBottom: 24,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  confidenceBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  creditsInfo: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  creditsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  creditsBold: {
    fontWeight: '700',
    fontSize: 18,
  },
  analyzeButton: {
    marginBottom: 16,
  },
});