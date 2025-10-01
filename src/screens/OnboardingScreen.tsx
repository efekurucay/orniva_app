import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../components/Icon';
import { BirdIcon } from '../components/BirdIcon';
import { AppIcons } from '../constants/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof AppIcons;
  title: string;
  titleTr: string;
  description: string;
  descriptionTr: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'bird',
    title: 'Welcome to Orniva',
    titleTr: 'Orniva\'ya Hoş Geldiniz',
    description: 'Identify any bird species instantly using the power of AI. Discover the fascinating world of birds around you!',
    descriptionTr: 'Yapay zeka gücüyle herhangi bir kuş türünü anında tanıyın. Etrafınızdaki kuşların büyüleyici dünyasını keşfedin!',
  },
  {
    id: '2',
    icon: 'camera',
    title: 'Snap a Photo',
    titleTr: 'Fotoğraf Çek',
    description: 'Simply take a clear photo of any bird. Our AI will analyze it and identify the species with high accuracy.',
    descriptionTr: 'Sadece bir kuşun net bir fotoğrafını çekin. Yapay zekamız analiz edip yüksek doğrulukla türü belirleyecek.',
  },
  {
    id: '3',
    icon: 'wallet',
    title: 'Credits System',
    titleTr: 'Kredi Sistemi',
    description: 'Each identification uses 1 credit. Purchase credit packages anytime to keep exploring and learning!',
    descriptionTr: 'Her tanımlama 1 kredi kullanır. Keşfetmeye ve öğrenmeye devam etmek için istediğiniz zaman kredi paketi satın alın!',
  },
  {
    id: '4',
    icon: 'sparkles',
    title: 'Start Your Journey',
    titleTr: 'Yolculuğunuza Başlayın',
    description: 'You\'ll receive 3 free credits to get started. Ready to discover the birds in your backyard?',
    descriptionTr: 'Başlamak için 3 ücretsiz kredi alacaksınız. Bahçenizdeki kuşları keşfetmeye hazır mısınız?',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      onComplete();
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.slideContent}>
        <View style={[styles.emojiContainer, { backgroundColor: colors.surface }]}>
          {item.icon === 'bird' ? (
            <BirdIcon size="xxl" />
          ) : (
            <Icon name={AppIcons[item.icon]} size="xxl" color="primary" />
          )}
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex ? colors.primary : colors.border,
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderDots()}
        
        <TouchableOpacity
          style={styles.nextButtonContainer}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButtonContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  nextButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});