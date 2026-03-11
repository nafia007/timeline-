ALTER TABLE public.profiles ADD COLUMN show_bank_details boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN show_crypto_wallet boolean NOT NULL DEFAULT true;