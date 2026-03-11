
-- Add featured_filmmaker column to profiles
ALTER TABLE public.profiles ADD COLUMN featured_filmmaker boolean NOT NULL DEFAULT false;

-- Create index for quick lookup of featured filmmakers
CREATE INDEX idx_profiles_featured_filmmaker ON public.profiles (featured_filmmaker) WHERE featured_filmmaker = true;
