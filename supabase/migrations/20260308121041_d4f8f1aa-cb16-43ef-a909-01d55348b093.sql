
-- === FIX 1: Public profiles financial data exposure ===
-- Create a view that masks bank_details/crypto_wallet based on show_ flags
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id, user_id, username, display_name, bio, avatar_url, role,
  featured_filmmaker, created_at, updated_at,
  show_bank_details, show_crypto_wallet,
  CASE WHEN show_bank_details THEN bank_details ELSE NULL END AS bank_details,
  CASE WHEN show_crypto_wallet THEN crypto_wallet ELSE NULL END AS crypto_wallet
FROM public.profiles;

-- === FIX 2: Storage ownership checks ===
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

CREATE POLICY "Users can update own uploads"
ON storage.objects FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- === FIX 3: Prevent filmmaker self-approval ===
CREATE OR REPLACE FUNCTION public.prevent_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change film status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_film_status_change
  BEFORE UPDATE ON public.films
  FOR EACH ROW EXECUTE FUNCTION public.prevent_status_change();
