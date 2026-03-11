
-- Add solana_wallet and bitcoin_wallet columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS solana_wallet text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bitcoin_wallet text DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_solana_wallet boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_bitcoin_wallet boolean NOT NULL DEFAULT true;

-- Recreate public_profiles view to include new wallet columns
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles WITH (security_invoker = false) AS
SELECT
  id, user_id, username, display_name, bio, avatar_url, role,
  featured_filmmaker, show_bank_details, show_crypto_wallet, show_solana_wallet, show_bitcoin_wallet,
  CASE WHEN show_bank_details THEN bank_details ELSE NULL END AS bank_details,
  CASE WHEN show_crypto_wallet THEN crypto_wallet ELSE NULL END AS crypto_wallet,
  CASE WHEN show_solana_wallet THEN solana_wallet ELSE NULL END AS solana_wallet,
  CASE WHEN show_bitcoin_wallet THEN bitcoin_wallet ELSE NULL END AS bitcoin_wallet,
  created_at, updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;
