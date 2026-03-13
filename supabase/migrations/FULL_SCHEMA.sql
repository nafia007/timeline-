-- ============================================================================
-- TIMELINE FILM PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This file contains the complete schema for the Timeline film platform.
-- Run this SQL in your Supabase SQL Editor to set up the database.
-- ============================================================================

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Profiles table (users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('filmmaker', 'viewer')),
  featured_filmmaker BOOLEAN DEFAULT false,
  -- Subscription fields
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  -- Financial fields
  bank_details TEXT,
  show_bank_details BOOLEAN DEFAULT false,
  crypto_wallet TEXT,
  show_crypto_wallet BOOLEAN DEFAULT false,
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Films table
CREATE TABLE public.films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filmmaker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  video_url TEXT,
  trailer_url TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requires_auth BOOLEAN DEFAULT false,
  is_vertical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Posts table (social feed)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Post likes
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_profile_id)
);

-- Post comments
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Donations tracking table
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

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. SUBSCRIPTION TABLES
-- ============================================================================

-- Subscription Plans Table (use TEXT ID for compatibility)
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  price_monthly_cents INTEGER,
  price_yearly_cents INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending Payments Table (for Peach Payments)
CREATE TABLE pending_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  peach_transaction_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. USER ROLES SYSTEM
-- ============================================================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_films_updated_at BEFORE UPDATE ON public.films FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent filmmaker self-approval trigger
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

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Public profiles view (masks financial data)
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

-- Films RLS
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved films are viewable by everyone" ON public.films FOR SELECT USING (status = 'approved');
CREATE POLICY "Filmmakers can view their own films" ON public.films FOR SELECT USING (filmmaker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can view all films" ON public.films FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Filmmakers can insert their own films" ON public.films FOR INSERT WITH CHECK (filmmaker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'filmmaker'));
CREATE POLICY "Filmmakers can update their own films" ON public.films FOR UPDATE USING (filmmaker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Filmmakers can delete their own films" ON public.films FOR DELETE USING (filmmaker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Follows RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (follower_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (follower_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Posts RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can delete any post" ON public.posts FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any post" ON public.posts FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Post likes RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (user_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (user_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Post comments RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can delete any comment" ON public.post_comments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Donations RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Filmmakers can view own donations" ON public.donations FOR SELECT USING (filmmaker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Filmmakers can insert own donations" ON public.donations FOR INSERT WITH CHECK (filmmaker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Filmmakers can delete own donations" ON public.donations FOR DELETE USING (filmmaker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Filmmakers can update own donations" ON public.donations FOR UPDATE USING (filmmaker_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- User roles RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Subscription plans RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans FOR SELECT USING (is_active = true);

-- Pending payments RLS
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pending payments" ON pending_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pending payments" ON pending_payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User subscriptions RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 6. STORAGE BUCKETS
-- ============================================================================

-- Note: Storage policies are handled by Supabase defaults
-- You can configure custom policies in the Supabase Dashboard > Storage > Policies

-- ============================================================================
-- 7. INDEXES
-- ============================================================================

CREATE INDEX idx_films_filmmaker ON public.films(filmmaker_id);
CREATE INDEX idx_films_status ON public.films(status);
CREATE INDEX idx_films_genre ON public.films(genre);
CREATE INDEX idx_films_created ON public.films(created_at DESC);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX idx_donations_filmmaker ON public.donations(filmmaker_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_is_verified ON public.profiles(is_verified);
CREATE INDEX idx_pending_payments_user_id ON pending_payments(user_id);
CREATE INDEX idx_pending_payments_status ON pending_payments(status);

-- ============================================================================
-- 8. DEFAULT SUBSCRIPTION PLANS
-- ============================================================================

INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, price_monthly_cents, price_yearly_cents, features, is_active) VALUES
(
  'basic',
  'Basic',
  'SD streaming quality, watch on 1 device, limited library access',
  49.00,
  490.00,
  4900,
  49000,
  '["SD streaming quality", "Watch on 1 device", "Limited library access", "Cancel anytime"]'::jsonb,
  true
),
(
  'standard',
  'Standard',
  'Full HD streaming, watch on 2 devices, full library access, offline downloads',
  99.00,
  990.00,
  9900,
  99000,
  '["Full HD streaming", "Watch on 2 devices", "Full library access", "Offline downloads", "Cancel anytime"]'::jsonb,
  true
),
(
  'premium',
  'Premium',
  '4K Ultra HD + HDR, watch on 4 devices, full library + early access, offline downloads, Dolby Atmos audio',
  149.00,
  1490.00,
  14900,
  149000,
  '["4K Ultra HD + HDR", "Watch on 4 devices", "Full library + early access", "Offline downloads", "Dolby Atmos audio", "Cancel anytime"]'::jsonb,
  true
);

-- ============================================================================
-- 9. REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
