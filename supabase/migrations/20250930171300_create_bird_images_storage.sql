-- NOTE: Storage buckets must be created via Supabase Dashboard or Management API
-- This migration only creates the RLS policies for the storage.objects table
-- 
-- IMPORTANT: The bucket should be PUBLIC for direct image access
-- 
-- To create the bucket manually:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: bird-images
-- 4. Public: TRUE (checked) ← IMPORTANT: Must be public!
-- 5. File size limit: 10 MB
-- 6. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
--
-- Or via SQL (after bucket creation):
-- UPDATE storage.buckets SET public = true WHERE id = 'bird-images';

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Users can upload images to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Policy: Allow authenticated users to upload images to their own folder in bird-images bucket
CREATE POLICY "Users can upload images to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bird-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own images from bird-images bucket
CREATE POLICY "Users can read their own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bird-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own images in bird-images bucket
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bird-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'bird-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own images from bird-images bucket
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bird-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
