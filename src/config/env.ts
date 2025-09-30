// Environment configuration
// Uses standard .env file for environment variables
//
// For production builds:
// 1. Create .env file with your production values
// 2. Or set EXPO_PUBLIC_* environment variables directly
//
// Environment variables are automatically loaded by Expo

// Fallback values for development (used if .env file is missing)
const DEV_SUPABASE_URL = 'https://coowimujsrlgrcifebhm.supabase.co';
const DEV_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb3dpbXVqc3JsZ3JjaWZlYmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODA2NTksImV4cCI6MjA3NDc1NjY1OX0.h8UBpS3TXK4_EiJLXbmiykLCjKedK79ziAe5k_kce78';

export const ENV = {
  // Use .env file values, fallback to dev values
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || DEV_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEV_SUPABASE_ANON_KEY,
  
  // NOTE: Gemini API is now called via Supabase Edge Function for security
  // API key is stored server-side in Supabase secrets, NOT in client code
  // 
  // To configure:
  //   supabase secrets set GEMINI_API_KEY=your_key
  //   supabase functions deploy identify-bird
  //
  // See: supabase/functions/identify-bird/ for Edge Function implementation
} as const;
