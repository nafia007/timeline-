ALTER TABLE public.films ADD COLUMN IF NOT EXISTS trailer_url text DEFAULT NULL;
ALTER TABLE public.films ADD COLUMN IF NOT EXISTS requires_auth boolean NOT NULL DEFAULT false;