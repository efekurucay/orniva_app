import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { t, tv } from '../utils/i18n';
import { uriToBase64DataUri, validateImageSize } from '../utils/imageUtils';
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
        
        // Validate image size before processing
        const validation = validateImageSize(imageUri, 5); // 5MB max
        if (!validation.isValid) {
          Toast.show({
            type: 'error',
            text1: 'Image Too Large',
            text2: validation.errorMessage || 'Please select a smaller image.',
          });
          return;
        }
        
        // Convert local file to base64 data URI using modern File API
        const dataUri = await uriToBase64DataUri(imageUri);
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
        
        // Validate image size before processing
        const validation = validateImageSize(imageUri, 5); // 5MB max
        if (!validation.isValid) {
          Toast.show({
            type: 'error',
            text1: 'Image Too Large',
            text2: validation.errorMessage || 'Please select a smaller image.',
          });
          return;
        }
        
        // Convert local file to base64 data URI using modern File API
        const dataUri = await uriToBase64DataUri(imageUri);
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
          <Text style={[styles.appName, { color: colors.text }]}>Orniva</Text>
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

      {/* Credit Display */}
      <TouchableOpacity
        style={[styles.creditCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('Purchase')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creditGradient}
        >
          <Text style={styles.creditLabel}>{t('credits', user?.language)}</Text>
          <View style={styles.creditRow}>
            <Text style={styles.creditValue}>{user?.credits || 0}</Text>
            <Text style={styles.addCreditsHint}>+</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={[styles.quote, { color: colors.textSecondary }]}>
          {t('inspirationalQuote', user?.language)}
        </Text>

        <View style={styles.uploadContainer}>
          <View style={[styles.uploadIcon, { backgroundColor: colors.surface }]}>
            <Text style={{ fontSize: 80 }}>📸</Text>
          </View>

          <Button
            title={t('uploadPhoto', user?.language)}
            onPress={handleUploadPress}
            variant="primary"
            style={styles.uploadButton}
          />

          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Upload a clear photo of a bird to identify its species
          </Text>
        </View>
      </View>

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
  creditCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  creditGradient: {
    padding: 24,
    alignItems: 'center',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
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
  },
  uploadIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    width: '100%',
    marginBottom: 16,
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