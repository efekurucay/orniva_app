-- Add image_url column to bird_analyses table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bird_analyses' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE bird_analyses ADD COLUMN image_url TEXT;
  END IF;
END $$;
