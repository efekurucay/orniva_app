// Orniva Bird Identification Edge Function
// Uses Gemini AI API for secure server-side bird recognition

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers for client requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BirdIdentificationRequest {
  imageUri: string;
  user_id: string;
}

interface BirdIdentificationResult {
  species: string;
  confidence: number;
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured in Supabase secrets');
    }

    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { imageUri, user_id }: BirdIdentificationRequest = await req.json();
    
    if (!imageUri || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageUri and user_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing bird identification for user: ${user_id}`);

    // ✅ Check user credits BEFORE processing (optimistic check)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', user_id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    if (userProfile.credits < 1) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Insufficient credits. Please purchase more credits to continue.',
          retryable: false 
        }),
        { 
          status: 402, // Payment Required
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process image data
    let base64Image: string;
    let mimeType: string = 'image/jpeg';
    let imageBuffer: Uint8Array;
    
    try {
      if (imageUri.startsWith('data:image')) {
        // Parse data URI format: "data:image/jpeg;base64,/9j/4AAQ..."
        const parts = imageUri.split(',');
        if (parts.length !== 2) {
          throw new Error('Invalid data URI format');
        }
        
        // Extract MIME type from data URI header
        const header = parts[0]; // "data:image/jpeg;base64"
        const mimeMatch = header.match(/data:([^;]+)/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        
        base64Image = parts[1];
        
        // Convert base64 to Uint8Array for storage upload
        const binaryString = atob(base64Image);
        imageBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBuffer[i] = binaryString.charCodeAt(i);
        }
        
        console.log(`Processing base64 image, MIME type: ${mimeType}, size: ${base64Image.length} chars`);
      } else if (imageUri.startsWith('http')) {
        // Remote URL - fetch and convert
        console.log('Fetching remote image:', imageUri);
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        mimeType = blob.type || 'image/jpeg';
        const arrayBuffer = await blob.arrayBuffer();
        imageBuffer = new Uint8Array(arrayBuffer);
        base64Image = btoa(String.fromCharCode(...imageBuffer));
      } else if (imageUri.startsWith('file://')) {
        // ❌ REMOVED: Local file access not supported in production
        throw new Error('Local file paths are not supported. Please send images as base64 data URIs.');
      } else {
        // Assume it's already base64 string
        base64Image = imageUri;
        const binaryString = atob(base64Image);
        imageBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBuffer[i] = binaryString.charCodeAt(i);
        }
        console.log('Processing raw base64 string, size:', base64Image.length);
      }
      
      // Validate base64 string
      if (!base64Image || base64Image.length === 0) {
        throw new Error('Empty or invalid image data');
      }
      
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro" // More accurate and powerful model for image analysis
    });

    // Prepare the prompt for bird identification
    const prompt = `You are an expert ornithologist. Analyze this bird image and provide:
1. The exact bird species name (common name and scientific name)
2. Confidence level as a percentage (0-100)
3. A brief description of the bird (2-3 sentences including distinctive features, habitat, and behavior)

Format your response EXACTLY as follows:
SPECIES: [Bird Species Name]
SCIENTIFIC: [Scientific Name]
CONFIDENCE: [number between 0-100]
DESCRIPTION: [Brief description]

If you cannot identify the bird or if this is not a bird image, respond with:
SPECIES: Unknown
SCIENTIFIC: N/A
CONFIDENCE: 0
DESCRIPTION: Unable to identify a bird in this image. Please upload a clear photo of a bird.`;

    // Prepare image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType // Use detected MIME type
      }
    };

    // Call Gemini API with timeout protection
    console.log('Calling Gemini API...');
    const timeoutMs = 60000; // 60 second timeout
    const geminiCall = model.generateContent([prompt, imagePart]);
    
    const result = await Promise.race([
      geminiCall,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API timeout after 60 seconds')), timeoutMs)
      )
    ]) as any;

    // Extract response text
    const response = await result.response;
    const text = response.text();
    console.log('Gemini API response received, length:', text.length);

    // Parse the response
    const parsedResult = parseGeminiResponse(text);

    // ✅ Upload image to Supabase Storage
    let imageUrl: string | null = null;
    try {
      const fileExtension = mimeType.split('/')[1] || 'jpg';
      const timestamp = Date.now();
      const fileName = `${user_id}/${timestamp}.${fileExtension}`;

      console.log(`Uploading image to storage: ${fileName}`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bird-images')
        .upload(fileName, imageBuffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload image:', uploadError);
      } else {
        // Get public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('bird-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
        console.log(`Image uploaded successfully: ${imageUrl}`);
      }
    } catch (storageError) {
      console.error('Storage error:', storageError);
      // Non-critical - continue without image URL
    }

    // ✅ Deduct credit ONLY after successful analysis
    const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_credit', {
      user_id_param: user_id
    });

    if (deductError) {
      console.error('Failed to deduct credit:', deductError);
      // Still return the analysis result but log the credit deduction failure
      // This ensures user gets their analysis even if credit system has issues
    } else if (deductResult && deductResult.success) {
      console.log(`Credit deducted for user: ${user_id}. Remaining credits: ${deductResult.credits_remaining}`);
    } else if (deductResult) {
      console.error('Credit deduction failed:', deductResult.error);
      // Still proceed with returning the analysis result
    }

    // Save analysis to history with image URL
    try {
      await supabase.from('bird_analyses').insert({
        user_id: user_id,
        bird_species: parsedResult.species,
        confidence: parsedResult.confidence,
        description: parsedResult.description,
        image_url: imageUrl,
      });
    } catch (historyError) {
      console.error('Failed to save analysis history:', historyError);
      // Non-critical error - don't fail the request
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        result: parsedResult,
        image_url: imageUrl,
        timestamp: new Date().toISOString(),
        model_used: 'gemini-2.5-pro' // Using more powerful model for better accuracy
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);

    // Handle specific error types
    let statusCode = 500;
    let errorMessage = error.message || 'Internal server error';
    let retryable = false;

    if (error.message?.includes('timeout')) {
      statusCode = 408;
      errorMessage = 'Request timeout. Please try again.';
      retryable = true;
    } else if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      statusCode = 429;
      errorMessage = 'API rate limit exceeded. Please try again later.';
      retryable = true;
    } else if (error.message?.includes('401') || error.message?.includes('API key')) {
      statusCode = 500;
      errorMessage = 'API configuration error. Please contact support.';
      retryable = false;
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        retryable: retryable,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Parse Gemini API response text into structured data
 */
function parseGeminiResponse(text: string): BirdIdentificationResult {
  try {
    // Extract species name
    const speciesMatch = text.match(/SPECIES:\s*(.+?)(?:\n|$)/i);
    const scientificMatch = text.match(/SCIENTIFIC:\s*(.+?)(?:\n|$)/i);
    const confidenceMatch = text.match(/CONFIDENCE:\s*(\d+)/i);
    const descriptionMatch = text.match(/DESCRIPTION:\s*(.+?)(?:\n\n|$)/is);

    let species = speciesMatch ? speciesMatch[1].trim() : 'Unknown Bird';
    const scientific = scientificMatch ? scientificMatch[1].trim() : '';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : 0;
    const description = descriptionMatch
      ? descriptionMatch[1].trim()
      : 'Unable to analyze this image.';

    // Combine common and scientific name
    if (scientific && scientific !== 'N/A') {
      species = `${species} (${scientific})`;
    }

    // Validate confidence range
    const validConfidence = Math.max(0, Math.min(100, confidence));

    return {
      species,
      confidence: validConfidence,
      description,
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    // Return safe fallback
    return {
      species: 'Unknown Bird',
      confidence: 0,
      description: 'Unable to parse the analysis result. Please try again.',
    };
  }
}