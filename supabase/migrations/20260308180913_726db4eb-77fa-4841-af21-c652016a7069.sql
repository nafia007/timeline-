
-- ============================================
-- FIX 1: Profiles table — restrict SELECT to owners/admins
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- FIX 1b: Recreate public_profiles view as SECURITY DEFINER
-- so it can bypass RLS and serve masked data publicly
-- ============================================
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles WITH (security_invoker = false) AS
SELECT
  id, user_id, username, display_name, bio, avatar_url, role,
  featured_filmmaker, show_bank_details, show_crypto_wallet,
  CASE WHEN show_bank_details THEN bank_details ELSE NULL END AS bank_details,
  CASE WHEN show_crypto_wallet THEN crypto_wallet ELSE NULL END AS crypto_wallet,
  created_at, updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ============================================
-- FIX 2: Films — enforce moderation status in RLS
-- ============================================
DROP POLICY IF EXISTS "Approved films are viewable by everyone" ON public.films;
DROP POLICY IF EXISTS "Filmmakers can view their own films" ON public.films;
DROP POLICY IF EXISTS "Admins can view all films" ON public.films;

CREATE POLICY "Films visible by status or ownership" ON public.films
FOR SELECT USING (
  status = 'approved'
  OR filmmaker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);
