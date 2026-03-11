
-- Add status column to films
ALTER TABLE public.films ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Update existing films to approved
UPDATE public.films SET status = 'approved';

-- Drop old SELECT policy and create new ones
DROP POLICY IF EXISTS "Films are viewable by everyone" ON public.films;

-- Public can only see approved films
CREATE POLICY "Approved films are viewable by everyone"
ON public.films
FOR SELECT
USING (status = 'approved');

-- Filmmakers can see their own films (any status)
CREATE POLICY "Filmmakers can view their own films"
ON public.films
FOR SELECT
USING (filmmaker_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Admins can see all films
CREATE POLICY "Admins can view all films"
ON public.films
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
