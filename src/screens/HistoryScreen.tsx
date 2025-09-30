import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../utils/i18n';
import { supabase } from '../config/supabase';
import { BirdAnalysis, RootStackParamList } from '../types';
import { ImageViewer } from '../components/ImageViewer';

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [analyses, setAnalyses] = useState<BirdAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<{ [key: string]: boolean }>({});

  const loadAnalyses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bird_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Error loading analyses:', error);
      Toast.show({
        type: 'error',
        text1: t('error', user?.language),
        text2: error.message || 'Failed to load history',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load analyses when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAnalyses();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyses();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setViewerVisible(true);
  };

  const handleCloseViewer = () => {
    setViewerVisible(false);
    setTimeout(() => setSelectedImageUrl(null), 300);
  };

  const handleImageLoadStart = (itemId: string) => {
    setImageLoadStates(prev => ({ ...prev, [itemId]: true }));
  };

  const handleImageLoadEnd = (itemId: string) => {
    setImageLoadStates(prev => ({ ...prev, [itemId]: false }));
  };

  const renderAnalysisItem = ({ item }: { item: BirdAnalysis }) => (
    <TouchableOpacity
      style={[styles.analysisCard, { backgroundColor: colors.surface }]}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {item.image_url ? (
          <TouchableOpacity
            onPress={() => handleImagePress(item.image_url!)}
            activeOpacity={0.8}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.birdImage}
                resizeMode="cover"
                onLoadStart={() => handleImageLoadStart(item.id)}
                onLoadEnd={() => handleImageLoadEnd(item.id)}
                onError={() => handleImageLoadEnd(item.id)}
              />
              {imageLoadStates[item.id] && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
              {/* Zoom indicator */}
              <View style={styles.zoomIndicator}>
                <Text style={styles.zoomIcon}>🔍</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.birdImage, styles.placeholderImage, { backgroundColor: colors.border }]}>
            <Text style={styles.placeholderIcon}>🦅</Text>
          </View>
        )}
        
        <View style={styles.infoContainer}>
          <Text style={[styles.speciesName, { color: colors.text }]} numberOfLines={1}>
            {item.bird_species}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.confidenceText, { color: colors.primary }]}>
                {Math.round(item.confidence)}% {t('confidence', user?.language)}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}

          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t('noHistoryYet', user?.language)}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {t('startIdentifying', user?.language)}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.emptyButtonText}>
          {t('identifyBird', user?.language)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('history', user?.language)}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Stats Card */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
      >
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analyses.length}</Text>
          <Text style={styles.statLabel}>{t('identifications', user?.language)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Set(analyses.map(a => a.bird_species)).size}
          </Text>
          <Text style={styles.statLabel}>{t('uniqueSpecies', user?.language)}</Text>
        </View>
      </LinearGradient>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={analyses}
          renderItem={renderAnalysisItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={viewerVisible}
        imageUrl={selectedImageUrl}
        onClose={handleCloseViewer}
      />
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
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  analysisCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  birdImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIcon: {
    fontSize: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    opacity: 0.3,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  speciesName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});