import { supabase } from '../config/supabase';
import { BirdRecognitionResult } from '../types';

interface EdgeFunctionResponse {
  success: boolean;
  result?: BirdRecognitionResult;
  error?: string;
  retryable?: boolean;
  timestamp: string;
  model_used?: string;
}

export const edgeFunctionService = {
  /**
   * Identify bird using Supabase Edge Function (secure server-side Gemini API call)
   */
  async identifyBird(imageUri: string, userId: string): Promise<BirdRecognitionResult> {
    try {
      console.log('Calling Edge Function for bird identification...');

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>(
        'identify-bird',
        {
          body: {
            imageUri,
            user_id: userId,
          },
        }
      );

      // Handle Edge Function errors
      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(error.message || 'Edge Function call failed');
      }

      // Handle unsuccessful response
      if (!data || !data.success) {
        const errorMessage = data?.error || 'Bird identification failed';
        const isRetryable = data?.retryable || false;
        
        const error: any = new Error(errorMessage);
        error.retryable = isRetryable;
        throw error;
      }

      // Return the parsed result
      if (!data.result) {
        throw new Error('No result returned from Edge Function');
      }

      console.log('Bird identification successful:', data.result.species);
      return data.result;

    } catch (error: any) {
      console.error('Bird identification error:', error);

      // Handle specific error types
      if (error.message?.includes('timeout')) {
        throw new Error('Identification is taking longer than expected. Please try again.');
      }

      if (error.message?.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }

      // Re-throw with cleaned message
      throw new Error(error.message || 'Unable to identify bird. Please try again.');
    }
  },

  /**
   * Check if Edge Function is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('identify-bird', {
        body: { test: true },
      });
      
      // If we get a response (even an error), the function is accessible
      return true;
    } catch (error) {
      console.error('Edge Function health check failed:', error);
      return false;
    }
  },
};