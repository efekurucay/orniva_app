import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../components/Icon';
import { AppIcons } from '../constants/icons';
import { t } from '../utils/i18n';
import { Language, RootStackParamList } from '../types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const DELETION_CONFIRM_TEXT = 'DELETE MY ACCOUNT';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, signOut, updateProfile } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleLanguageChange = async (newLanguage: Language) => {
    if (!user || user.language === newLanguage) return;

    setLoading(true);
    try {
      await updateProfile({ language: newLanguage });
      Toast.show({
        type: 'success',
        text1: t('success', newLanguage),
        text2: t('profileUpdated', newLanguage),
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('error', user.language),
        text2: error.message || t('genericError', user.language),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user) return;

    if (deleteConfirmText.trim() !== DELETION_CONFIRM_TEXT) {
      Toast.show({
        type: 'error',
        text1: t('error', user.language),
        text2: 'Please type "DELETE MY ACCOUNT" exactly to confirm',
        visibilityTime: 3000,
      });
      return;
    }

    setIsDeleting(true);
    setShowDeleteModal(false);
    setDeleteConfirmText('');

    Toast.show({
      type: 'info',
      text1: t('deleteAccountProcessing', user.language),
      visibilityTime: 0, // Stay until dismissed
    });

    try {
      // Import authService
      const { authService } = await import('../services/authService');
      
      // Delete the account
      await authService.deleteAccount(user.id);

      // Hide processing toast
      Toast.hide();

      // Show success message
      Toast.show({
        type: 'success',
        text1: t('success', user.language),
        text2: t('deleteAccountSuccess', user.language),
        visibilityTime: 3000,
      });

      // Sign out (this will redirect to auth screen)
      setTimeout(async () => {
        await signOut();
      }, 1000);
    } catch (error: any) {
      console.error('Delete account error:', error);
      Toast.hide();
      Toast.show({
        type: 'error',
        text1: t('error', user.language),
        text2: error.message || t('deleteAccountError', user.language),
        visibilityTime: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout', user?.language),
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('logout', user?.language),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Toast.show({
                type: 'success',
                text1: t('success', user?.language),
                text2: t('signOutSuccess', user?.language),
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: t('error', user?.language),
                text2: error.message || t('genericError', user?.language),
              });
            }
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name={AppIcons.back} size="md" color="text" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('settings', user?.language)}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('profile', user?.language)}
          </Text>

          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.username ? user.username[0].toUpperCase() : user?.email[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.username || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={[styles.creditsDisplay, { backgroundColor: colors.surface }]}>
            <Text style={[styles.creditsLabel, { color: colors.textSecondary }]}>
              {t('credits', user?.language)}
            </Text>
            <Text style={[styles.creditsValue, { color: colors.primary }]}>
              {user?.credits || 0}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.purchaseButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Purchase')}
            activeOpacity={0.8}
          >
            <View style={styles.purchaseButtonContent}>
              <Icon name={AppIcons.wallet} size="sm" color="white" />
              <Text style={styles.purchaseButtonText}>
                {t('buyCredits', user?.language)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Icon 
                name={isDark ? AppIcons.theme : AppIcons.themeSun} 
                size="md" 
                color="primary" 
              />
              <Text style={[styles.settingText, { color: colors.text }]}>
                {t('darkMode', user?.language)}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? colors.buttonText : colors.surface}
            />
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('language', user?.language)}
          </Text>

          <TouchableOpacity
            style={[
              styles.languageOption,
              user?.language === 'en' && { backgroundColor: colors.surface },
            ]}
            onPress={() => handleLanguageChange('en')}
            disabled={loading}
          >
            <Icon name={AppIcons.language} size="md" color={user?.language === 'en' ? 'primary' : 'textSecondary'} />
            <Text style={[styles.settingText, { color: colors.text }]}>English</Text>
            {user?.language === 'en' && (
              <Icon name={AppIcons.checkmark} size="sm" color="primary" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              user?.language === 'tr' && { backgroundColor: colors.surface },
            ]}
            onPress={() => handleLanguageChange('tr')}
            disabled={loading}
          >
            <Icon name={AppIcons.language} size="md" color={user?.language === 'tr' ? 'primary' : 'textSecondary'} />
            <Text style={[styles.settingText, { color: colors.text }]}>Türkçe</Text>
            {user?.language === 'tr' && (
              <Icon name={AppIcons.checkmark} size="sm" color="primary" />
            )}
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon name={AppIcons.logout} size="md" color="textSecondary" />
            <Text style={[styles.logoutText, { color: colors.text }]}>
              {t('logout', user?.language)}
            </Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={[styles.deleteAccountButton, { borderColor: colors.error }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={isDeleting}
          >
            <Icon name={AppIcons.deleteAccount} size="md" color="error" />
            <Text style={[styles.deleteAccountText, { color: colors.error }]}>
              {t('deleteAccount', user?.language)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Orniva v1.0.0
        </Text>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCancelDelete}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}
            >
              {/* Warning Icon */}
              <View style={[styles.warningIconContainer, { backgroundColor: colors.error + '20' }]}>
                <Icon name={AppIcons.deleteAccount} size="lg" color="error" />
              </View>

              {/* Title */}
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('deleteAccountWarning', user?.language)}
              </Text>

              {/* Description */}
              <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                {t('deleteAccountMessage', user?.language)}
              </Text>

              {/* Confirmation Instructions */}
              <View style={[styles.confirmInstructions, { backgroundColor: colors.surface }]}>
                <Text style={[styles.confirmInstructionsText, { color: colors.text }]}>
                  To confirm, please type:
                </Text>
                <Text style={[styles.confirmCodeText, { color: colors.error }]}>
                  {DELETION_CONFIRM_TEXT}
                </Text>
              </View>

              {/* Text Input */}
              <TextInput
                style={[
                  styles.confirmInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: deleteConfirmText === DELETION_CONFIRM_TEXT 
                      ? colors.success 
                      : colors.border,
                  },
                ]}
                placeholder="Type here..."
                placeholderTextColor={colors.textSecondary}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { backgroundColor: colors.surface },
                  ]}
                  onPress={handleCancelDelete}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    {t('deleteAccountCancel', user?.language)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.deleteButton,
                    { 
                      backgroundColor: deleteConfirmText === DELETION_CONFIRM_TEXT 
                        ? colors.error 
                        : colors.border,
                    },
                  ]}
                  onPress={handleConfirmDelete}
                  activeOpacity={0.7}
                  disabled={deleteConfirmText !== DELETION_CONFIRM_TEXT}
                >
                  <Text style={styles.deleteButtonText}>
                    {t('deleteAccountConfirm', user?.language)}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  creditsDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  creditsLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  creditsValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  purchaseButton: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  checkmark: {
    marginLeft: 'auto',
    fontSize: 20,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 4,
    gap: 12,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  confirmInstructions: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  confirmInstructionsText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmCodeText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  confirmInput: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 2,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    // backgroundColor set dynamically
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
