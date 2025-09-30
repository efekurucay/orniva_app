import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/Button';
import { GradientButton } from '../components/GradientButton';
import { GradientText } from '../components/GradientText';
import { t, tv } from '../utils/i18n';
import { uriToBase64DataUri, validateImageSize, optimizeImage } from '../utils/imageUtils';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Rate limiting configuration
const RATE_LIMIT_COOLDOWN_MS = 5000; // 5 seconds between uploads

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    setShowImagePicker(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], // SDK 54 format
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false, // We'll convert manually for better control
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Validate original image size (increased to 10MB since we'll optimize)
        const validation = validateImageSize(imageUri, 10);
        if (!validation.isValid) {
          Toast.show({
            type: 'error',
            text1: 'Image Too Large',
            text2: validation.errorMessage || 'Please select a smaller image.',
          });
          return;
        }
        
        // Show optimization progress
        Toast.show({
          type: 'info',
          text1: 'Optimizing Image',
          text2: 'Preparing your image for analysis...',
          visibilityTime: 2000,
        });
        
        // ✨ NEW: Optimize image before conversion
        const optimizedImage = await optimizeImage(imageUri);
        
        console.log(`Optimization saved ${Math.round((1 - optimizedImage.optimizedSize / optimizedImage.originalSize) * 100)}% bandwidth`);
        
        // Convert optimized image to base64 data URI
        const dataUri = await uriToBase64DataUri(optimizedImage.uri);
        navigation.navigate('Analysis', { imageUri: dataUri });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to process image. Please try again.',
      });
    }
  };

  const handleChooseFromGallery = async () => {
    setShowImagePicker(false);

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // SDK 54 format
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false, // We'll convert manually for better control
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Validate original image size (increased to 10MB since we'll optimize)
        const validation = validateImageSize(imageUri, 10);
        if (!validation.isValid) {
          Toast.show({
            type: 'error',
            text1: 'Image Too Large',
            text2: validation.errorMessage || 'Please select a smaller image.',
          });
          return;
        }
        
        // Show optimization progress
        Toast.show({
          type: 'info',
          text1: 'Optimizing Image',
          text2: 'Preparing your image for analysis...',
          visibilityTime: 2000,
        });
        
        // ✨ NEW: Optimize image before conversion
        const optimizedImage = await optimizeImage(imageUri);
        
        console.log(`Optimization saved ${Math.round((1 - optimizedImage.optimizedSize / optimizedImage.originalSize) * 100)}% bandwidth`);
        
        // Convert optimized image to base64 data URI
        const dataUri = await uriToBase64DataUri(optimizedImage.uri);
        navigation.navigate('Analysis', { imageUri: dataUri });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to process image. Please try again.',
      });
    }
  };

  const handleUploadPress = () => {
    // Check if user is authenticated and has credits
    if (!user || user.credits <= 0) {
      Toast.show({
        type: 'error',
        text1: t('error', user?.language),
        text2: t('insufficientCredits', user?.language),
      });
      return;
    }

    // Rate limiting: Check if cooldown period has passed
    const now = Date.now();
    const timeSinceLastUpload = now - lastUploadTime;
    
    if (timeSinceLastUpload < RATE_LIMIT_COOLDOWN_MS && lastUploadTime > 0) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_COOLDOWN_MS - timeSinceLastUpload) / 1000);
      Toast.show({
        type: 'info',
        text1: t('pleaseWaitTitle', user?.language),
        text2: tv('rateLimitMessage', user?.language, {
          seconds: remainingSeconds,
          plural: remainingSeconds > 1 ? 's' : '',
        }),
        visibilityTime: 2000,
      });
      return;
    }

    // Update last upload time and show picker
    setLastUploadTime(now);
    setShowImagePicker(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.logo, { color: colors.primary }]}>🦩</Text>
          <GradientText variant="neon" style={styles.appName}>
            Orniva
          </GradientText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={{ fontSize: 24 }}>📜</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Credit Display with Glow */}
        <TouchableOpacity
          style={styles.creditCardContainer}
          onPress={() => navigation.navigate('Purchase')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.creditGradient, { 
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
            }]}
          >
            <Text style={styles.creditLabel}>{t('credits', user?.language)}</Text>
            <View style={styles.creditRow}>
              <Text style={styles.creditValue}>{user?.credits || 0}</Text>
              <Text style={styles.addCreditsHint}>+</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroGradientWrapper}
          >
            <Text style={styles.heroTitle}>
              Discover Birds
            </Text>
          </LinearGradient>
          <Text style={[styles.heroSubtitle, { color: colors.secondary }]}>
            with AI 🦅
          </Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
            {t('inspirationalQuote', user?.language)}
          </Text>
        </View>

        {/* Upload Section - MAIN ACTION */}
        <View style={styles.uploadContainer}>
          <Text style={[styles.uploadTitle, { color: colors.text }]}>📸 Start Identifying</Text>
          
          <LinearGradient
            colors={[colors.surface, colors.cardBackground]}
            style={[styles.uploadIcon, {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 5,
            }]}
          >
            <Text style={{ fontSize: 60 }}>📸</Text>
          </LinearGradient>

          <TouchableOpacity
            onPress={handleUploadPress}
            activeOpacity={0.8}
            style={styles.uploadButtonWrapper}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.uploadButton, {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }]}
            >
              <Text style={styles.uploadButtonText}>📷 {t('uploadPhoto', user?.language)}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Upload a clear photo of a bird to identify its species
          </Text>
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImagePicker}
        onRequestClose={() => setShowImagePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowImagePicker(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHandle} />
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Photo Source
            </Text>

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={handleTakePhoto}
            >
              <Text style={{ fontSize: 32, marginRight: 16 }}>📷</Text>
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                {t('takePhoto', user?.language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleChooseFromGallery}
            >
              <Text style={{ fontSize: 32, marginRight: 16 }}>🖼️</Text>
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                {t('chooseFromGallery', user?.language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  creditCardContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  creditGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  creditLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creditValue: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addCreditsHint: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    opacity: 0.7,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  heroGradientWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  quote: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  uploadContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadButtonWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  uploadButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 18,
    fontWeight: '500',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});