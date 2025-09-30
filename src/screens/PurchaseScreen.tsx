import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { t, tv } from '../utils/i18n';
import { CREDIT_PACKAGES, CreditPackage } from '../config/creditPackages';
import {
  initiatePurchase,
  getPurchaseHistory,
  restorePurchases,
  PurchaseRecord,
} from '../services/purchaseService';
import { RootStackParamList } from '../types';

type PurchaseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Purchase'>;

export const PurchaseScreen: React.FC = () => {
  const navigation = useNavigation<PurchaseScreenNavigationProp>();
  const { user, refreshProfile } = useAuth();
  const { colors } = useTheme();

  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) {
      loadPurchaseHistory();
    }
  }, [showHistory]);

  const loadPurchaseHistory = async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    try {
      const history = await getPurchaseHistory(user.id);
      setPurchaseHistory(history);
    } catch (error) {
      console.error('Error loading purchase history:', error);
      Toast.show({
        type: 'error',
        text1: t('error', user?.language),
        text2: 'Failed to load purchase history',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!user) return;

    setPurchasingPackageId(pkg.id);
    try {
      const result = await initiatePurchase(user.id, pkg.id);
      
      if (result.success) {
        // Refresh user data to get updated credit balance
        await refreshProfile();
        
        Toast.show({
          type: 'success',
          text1: t('purchaseSuccess', user?.language).replace('{credits}', String(pkg.credits)),
          text2: tv('purchaseSuccess', user?.language, { credits: pkg.credits }),
        });

        // Show mock payment warning in dev mode
        if (__DEV__) {
          setTimeout(() => {
            Alert.alert(
              'Development Mode',
              t('mockPaymentWarning', user?.language),
              [{ text: 'OK' }]
            );
          }, 1500);
        }
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Toast.show({
        type: 'error',
        text1: t('purchaseFailed', user?.language),
        text2: error.message || 'Please try again',
      });
    } finally {
      setPurchasingPackageId(null);
    }
  };

  const handleRestorePurchases = async () => {
    if (!user) return;

    setIsRestoring(true);
    try {
      const result = await restorePurchases(user.id);
      
      if (result.restored > 0) {
        await refreshProfile();
        Toast.show({
          type: 'success',
          text1: tv('restoreSuccess', user?.language, {
            count: result.restored,
            plural: result.restored > 1 ? 's' : '',
          }),
        });
      } else {
        Toast.show({
          type: 'info',
          text1: t('restoreNone', user?.language),
        });
      }
    } catch (error) {
      console.error('Restore error:', error);
      Toast.show({
        type: 'error',
        text1: t('error', user?.language),
        text2: 'Failed to restore purchases',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const renderPackageCard = (pkg: CreditPackage) => {
    const isPurchasing = purchasingPackageId === pkg.id;
    const pricePerCredit = (pkg.price / pkg.credits).toFixed(2);

    return (
      <TouchableOpacity
        key={pkg.id}
        style={[
          styles.packageCard,
          { backgroundColor: colors.surface },
          pkg.featured && styles.featuredCard,
        ]}
        onPress={() => handlePurchase(pkg)}
        disabled={isPurchasing}
        activeOpacity={0.7}
      >
        {pkg.featured && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              {pkg.badge === 'popular' ? t('mostPopular', user?.language) : t('bestValue', user?.language)}
            </Text>
          </View>
        )}

        <LinearGradient
          colors={pkg.featured ? [colors.primary + '20', colors.secondary + '20'] : ['transparent', 'transparent']}
          style={styles.packageContent}
        >
          <Text style={[styles.packageName, { color: colors.text }]}>{pkg.name}</Text>
          
          <View style={styles.creditsRow}>
            <Text style={[styles.creditsAmount, { color: colors.primary }]}>
              {pkg.credits}
            </Text>
            <Text style={[styles.creditsLabel, { color: colors.textSecondary }]}>
              {t('credits', user?.language)}
            </Text>
          </View>

          <Text style={[styles.price, { color: colors.text }]}>
            ${pkg.price.toFixed(2)}
          </Text>

          <Text style={[styles.pricePerCredit, { color: colors.textSecondary }]}>
            ${pricePerCredit} {t('perCredit', user?.language)}
          </Text>

          {isPurchasing ? (
            <View style={[styles.purchaseButton, { backgroundColor: colors.primary }]}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <View style={[styles.purchaseButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.purchaseButtonText}>
                {t('purchaseButton', user?.language)}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderPurchaseHistory = () => {
    if (isLoadingHistory) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (purchaseHistory.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noPurchaseHistory', user?.language)}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.historyContainer}>
        {purchaseHistory.map((purchase, index) => (
          <View
            key={purchase.transactionId}
            style={[
              styles.historyItem,
              { backgroundColor: colors.surface, borderBottomColor: colors.border },
              index === purchaseHistory.length - 1 && styles.historyItemLast,
            ]}
          >
            <View style={styles.historyItemLeft}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>
                {purchase.credits} {t('credits', user?.language)}
              </Text>
              <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                {new Date(purchase.purchaseDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={[styles.historyTransaction, { color: colors.textSecondary }]}>
                {t('transaction', user?.language)}: {purchase.transactionId}
              </Text>
            </View>
            <Text style={[styles.historyAmount, { color: colors.primary }]}>
              ${purchase.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

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
          {t('purchaseCredits', user?.language)}
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Balance */}
        <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
            {t('currentBalance', user?.language)}
          </Text>
          <Text style={[styles.balanceValue, { color: colors.primary }]}>
            {user?.credits || 0} {t('credits', user?.language)}
          </Text>
        </View>

        {/* Section Toggle */}
        <View style={styles.sectionToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !showHistory && { backgroundColor: colors.primary },
            ]}
            onPress={() => setShowHistory(false)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                !showHistory ? styles.toggleButtonTextActive : { color: colors.textSecondary },
              ]}
            >
              {t('creditPackages', user?.language)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showHistory && { backgroundColor: colors.primary },
            ]}
            onPress={() => setShowHistory(true)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                showHistory ? styles.toggleButtonTextActive : { color: colors.textSecondary },
              ]}
            >
              {t('purchaseHistory', user?.language)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        {!showHistory ? (
          <>
            {/* Packages Grid */}
            <View style={styles.packagesGrid}>
              {CREDIT_PACKAGES.map(renderPackageCard)}
            </View>

            {/* Restore Purchases (iOS only) */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestorePurchases}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.restoreButtonText, { color: colors.primary }]}>
                    {t('restorePurchases', user?.language)}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          renderPurchaseHistory()
        )}

        {/* Development Mode Warning */}
        {__DEV__ && !showHistory && (
          <View style={[styles.devWarning, { backgroundColor: colors.surface }]}>
            <Text style={[styles.devWarningText, { color: colors.textSecondary }]}>
              ⚠️ {t('mockPaymentWarning', user?.language)}
            </Text>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  sectionToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  packagesGrid: {
    gap: 16,
  },
  packageCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredCard: {
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packageContent: {
    padding: 24,
    alignItems: 'center',
  },
  packageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  creditsAmount: {
    fontSize: 48,
    fontWeight: '700',
    marginRight: 8,
  },
  creditsLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  pricePerCredit: {
    fontSize: 12,
    marginBottom: 20,
  },
  purchaseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  devWarning: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  devWarningText: {
    fontSize: 12,
    textAlign: 'center',
  },
  historyContainer: {
    gap: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  historyTransaction: {
    fontSize: 10,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});