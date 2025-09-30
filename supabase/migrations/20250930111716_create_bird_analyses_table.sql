-- Create bird_analyses table to track analysis history
CREATE TABLE IF NOT EXISTS public.bird_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bird_species TEXT NOT NULL,
  confidence NUMERIC(5,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bird_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analyses"
  ON public.bird_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON public.bird_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS bird_analyses_user_id_idx ON public.bird_analyses(user_id);
CREATE INDEX IF NOT EXISTS bird_analyses_created_at_idx ON public.bird_analyses(created_at DESC);