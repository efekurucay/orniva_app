-- Create deduct_user_credit function for atomic credit deduction
-- Synced from remote Supabase server on 2025-09-30

CREATE OR REPLACE FUNCTION public.deduct_user_credit(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  current_credits INTEGER;
  updated_credits INTEGER;
BEGIN
  -- Get current credits with row-level lock to prevent race conditions
  SELECT credits INTO current_credits
  FROM user_profiles
  WHERE id = user_id_param
  FOR UPDATE;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'credits_remaining', 0
    );
  END IF;
  
  -- Check if user has sufficient credits
  IF current_credits < 1 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_remaining', current_credits
    );
  END IF;
  
  -- Deduct 1 credit
  UPDATE user_profiles
  SET 
    credits = credits - 1,
    updated_at = NOW()
  WHERE id = user_id_param
  RETURNING credits INTO updated_credits;
  
  -- Return success with remaining credits
  RETURN jsonb_build_object(
    'success', true,
    'credits_deducted', 1,
    'credits_remaining', updated_credits
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Handle any unexpected errors
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'credits_remaining', 0
    );
END;
$function$;

-- Add comment for documentation
COMMENT ON FUNCTION public.deduct_user_credit(uuid) IS 
'Atomically deducts 1 credit from user account with row-level locking to prevent race conditions. Returns JSONB with success status and remaining credits.';