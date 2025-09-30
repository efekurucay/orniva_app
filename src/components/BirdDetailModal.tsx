import React from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { BirdAnalysis } from '../types';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BirdDetailModalProps {
  visible: boolean;
  analysis: BirdAnalysis | null;
  onClose: () => void;
  onImagePress?: (imageUrl: string) => void;
}

export const BirdDetailModal: React.FC<BirdDetailModalProps> = ({
  visible,
  analysis,
  onClose,
  onImagePress,
}) => {
  const { colors } = useTheme();

  if (!analysis) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Blurred Background */}
        {Platform.OS === 'ios' ? (
          <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBackdrop]} />
        )}

        {/* Modal Content */}
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {analysis.bird_species}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {/* Image */}
            {analysis.image_url && (
              <TouchableOpacity
                onPress={() => onImagePress?.(analysis.image_url!)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: analysis.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.imageZoomHint}>
                  <Text style={styles.zoomHintText}>Tap to enlarge</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Confidence Badge */}
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confidenceCard}
            >
              <Text style={styles.confidenceLabel}>Confidence</Text>
              <Text style={styles.confidenceValue}>
                {Math.round(analysis.confidence)}%
              </Text>
            </LinearGradient>

            {/* Description Section */}
            {analysis.description && (
              <View style={[styles.section, { backgroundColor: colors.background }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>📝</Text>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Description
                  </Text>
                </View>
                <Text style={[styles.descriptionText, { color: colors.text }]}>
                  {analysis.description}
                </Text>
              </View>
            )}

            {/* Date Section */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📅</Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Identified On
                </Text>
              </View>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate(analysis.created_at)}
              </Text>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  androidBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    flexWrap: 'wrap',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  image: {
    width: '100%',
    height: SCREEN_WIDTH - 80,
    maxHeight: 400,
    borderRadius: 16,
    marginBottom: 8,
  },
  imageZoomHint: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  zoomHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confidenceValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
