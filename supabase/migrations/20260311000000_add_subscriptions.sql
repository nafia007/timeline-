-- Subscription Plans Table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  peach_transaction_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status: pending, completed, failed, canceled
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  -- Status: trial, active, canceled, past_due, trialing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subscription fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_tier);
CREATE INDEX idx_pending_payments_user_id ON pending_payments(user_id);
CREATE INDEX idx_pending_payments_status ON pending_payments(status);

-- Insert default subscription plans (prices in ZAR)
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, price_monthly_cents, price_yearly_cents, features, is_active) VALUES
(
  'basic',
  'Basic',
  'SD streaming quality, watch on 1 device, limited library access',
  49.00,
  490.00,
  4900,
  49000,
  '[
    "SD streaming quality",
    "Watch on 1 device",
    "Limited library access",
    "Cancel anytime"
  ]'::jsonb,
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
  '[
    "Full HD streaming",
    "Watch on 2 devices",
    "Full library access",
    "Offline downloads",
    "Cancel anytime"
  ]'::jsonb,
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
  '[
    "4K Ultra HD + HDR",
    "Watch on 4 devices",
    "Full library + early access",
    "Offline downloads",
    "Dolby Atmos audio",
    "Cancel anytime"
  ]'::jsonb,
  true
);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Plans are viewable by everyone" 
ON subscription_plans FOR SELECT 
USING (is_active = true);

-- RLS Policies for pending_payments
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending payments" 
ON pending_payments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pending payments" 
ON pending_payments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription" 
ON user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" 
ON user_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" 
ON user_subscriptions FOR UPDATE 
USING (auth.uid() = user_id);
