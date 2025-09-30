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
  primary: '#4A90E2',
  secondary: '#50C878',
  background: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F39C12',
  border: '#E0E6ED',
  shadow: '#000000',
  cardBackground: '#FFFFFF',
  buttonText: '#FFFFFF',
};

export const darkColors = {
  primary: '#4A90E2',
  secondary: '#50C878',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  border: '#2C2C2C',
  shadow: '#000000',
  cardBackground: '#1E1E1E',
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
};