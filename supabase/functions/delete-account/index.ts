// Orniva Account Deletion Edge Function
// Securely deletes user account and all associated data
// Complies with Apple App Store Guidelines Article 5.1.1(v)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers for client requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization header',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // ✅ FIX: Extract token and pass it to getUser()
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized: Invalid session',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { user_id } = await req.json();

    // Verify the authenticated user is trying to delete their own account
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized: You can only delete your own account',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Starting account deletion for user: ${user_id}`);

    // Initialize admin client for deletion operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Delete all user's images from Supabase Storage
    console.log(`Step 1: Deleting storage files for user: ${user_id}`);
    let storageFilesDeleted = 0;
    try {
      // List all files in the user's folder
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from('bird-images')
        .list(user_id);

      if (!listError && files && files.length > 0) {
        // Delete each file
        const filePaths = files.map((file) => `${user_id}/${file.name}`);
        const { error: storageDeleteError } = await supabaseAdmin.storage
          .from('bird-images')
          .remove(filePaths);

        if (storageDeleteError) {
          console.error('Error deleting storage files:', storageDeleteError);
          // Continue anyway - non-critical error
        } else {
          storageFilesDeleted = files.length;
          console.log(`✓ Deleted ${storageFilesDeleted} storage files`);
        }
      } else {
        console.log('No storage files found or error listing:', listError?.message || 'none');
      }
    } catch (storageError) {
      console.error('Storage cleanup error (non-critical):', storageError);
      // Continue with account deletion even if storage cleanup fails
    }

    // Step 2: Delete from purchases table (manual deletion needed, no CASCADE)
    console.log(`Step 2: Deleting purchase records for user: ${user_id}`);
    let purchasesDeleted = 0;
    try {
      const { data: purchases, error: countError } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .eq('user_id', user_id);

      if (!countError && purchases) {
        purchasesDeleted = purchases.length;
      }

      const { error: purchasesDeleteError } = await supabaseAdmin
        .from('purchases')
        .delete()
        .eq('user_id', user_id);

      if (purchasesDeleteError) {
        console.error('Error deleting purchases:', purchasesDeleteError);
        // Continue anyway
      } else if (purchasesDeleted > 0) {
        console.log(`✓ Deleted ${purchasesDeleted} purchase records`);
      }
    } catch (purchasesError) {
      console.error('Purchases deletion error (non-critical):', purchasesError);
    }

    // Step 3: Delete the user using admin privileges
    // This will CASCADE delete from:
    // - user_profiles (via FK constraint)
    // - bird_analyses (via FK constraint)
    console.log(`Step 3: Deleting user account and cascading data: ${user_id}`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to delete account. Please try again later.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`✓ User account deleted successfully`);
    console.log(`Summary: Deleted ${storageFilesDeleted} files, ${purchasesDeleted} purchases, user profile, and bird analyses`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account successfully deleted',
        details: {
          storage_files_deleted: storageFilesDeleted,
          purchases_deleted: purchasesDeleted,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
