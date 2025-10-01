import { supabase } from '../config/supabase';
import { UserProfile } from '../types';

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, username?: string): Promise<UserProfile> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Update username if provided
    if (username) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ username })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error updating username:', updateError);
      }
    }

    const profile = await this.getUserProfile(authData.user.id);
    return profile;
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed');

    const profile = await this.getUserProfile(data.user.id);
    return profile;
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Profile not found');

    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Profile update failed');

    return data;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Delete user account
   * 
   * This will permanently delete:
   * - User's authentication record
   * - User profile
   * - All bird analyses
   * - All purchase history
   * - All uploaded bird images from Storage
   * 
   * This action is IRREVERSIBLE!
   * 
   * @param userId - The ID of the user to delete
   * @throws Error if deletion fails
   */
  async deleteAccount(userId: string): Promise<void> {
    // Call the delete-account Edge Function
    const { data, error } = await supabase.functions.invoke('delete-account', {
      body: { user_id: userId },
    });

    if (error) {
      console.error('Error calling delete-account function:', error);
      throw new Error(error.message || 'Failed to delete account');
    }

    if (!data || !data.success) {
      const errorMessage = data?.error || 'Failed to delete account';
      throw new Error(errorMessage);
    }

    console.log('Account deleted successfully:', data);
  },

};
