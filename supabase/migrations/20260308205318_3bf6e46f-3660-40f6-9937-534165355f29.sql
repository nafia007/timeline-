
-- Donations tracking table for manual entry by filmmakers
CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filmmaker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  chain text DEFAULT NULL,
  donor_name text DEFAULT NULL,
  note text DEFAULT NULL,
  donated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Filmmakers can only see their own donations
CREATE POLICY "Filmmakers can view own donations"
  ON public.donations FOR SELECT
  USING (filmmaker_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Filmmakers can insert their own donations
CREATE POLICY "Filmmakers can insert own donations"
  ON public.donations FOR INSERT
  WITH CHECK (filmmaker_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Filmmakers can delete their own donations
CREATE POLICY "Filmmakers can delete own donations"
  ON public.donations FOR DELETE
  USING (filmmaker_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Filmmakers can update their own donations
CREATE POLICY "Filmmakers can update own donations"
  ON public.donations FOR UPDATE
  USING (filmmaker_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));
