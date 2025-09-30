// Type definitions for the application

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  credits: number;
  language: 'en' | 'tr';
  created_at: string;
  updated_at: string;
}

export interface BirdAnalysis {
  id: string;
  user_id: string;
  bird_species: string;
  confidence: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface BirdRecognitionResult {
  species: string;
  confidence: number;
  description: string;
}

export type Language = 'en' | 'tr';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

export const lightColors = {
  primary: '#7C3AED',        // Deep purple
  secondary: '#A78BFA',      // Soft lavender
  background: '#FAFAFA',     // Very light gray
  surface: '#F5F3FF',        // Purple tinted surface
  text: '#1F2937',           // Dark gray
  textSecondary: '#6B7280',  // Medium gray
  error: '#EF4444',          // Soft red
  success: '#10B981',        // Soft green
  warning: '#F59E0B',        // Soft amber
  border: '#E9D5FF',         // Light purple border
  shadow: '#000000',
  cardBackground: '#FFFFFF',
  buttonText: '#FFFFFF',
};

export const darkColors = {
  primary: '#8B5CF6',        // Bright purple for dark mode
  secondary: '#A78BFA',      // Soft lavender
  background: '#0F172A',     // Deep navy blue-gray
  surface: '#1E1B2E',        // Dark purple-gray
  text: '#F9FAFB',           // Off white
  textSecondary: '#9CA3AF',  // Light gray
  error: '#F87171',          // Bright red
  success: '#34D399',        // Bright green
  warning: '#FBBF24',        // Bright amber
  border: '#312E81',         // Dark purple border
  shadow: '#000000',
  cardBackground: '#1E1B2E',
  buttonText: '#FFFFFF',
};

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Analysis: { imageUri: string };
  Results: {
    imageUri: string;
    result: BirdRecognitionResult;
  };
  Settings: undefined;
  Purchase: undefined;
  History: undefined;
};
