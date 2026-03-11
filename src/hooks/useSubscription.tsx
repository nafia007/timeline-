import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  price_monthly_cents: number | null;
  price_yearly_cents: number | null;
  features: string[];
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface SubscriptionContextType {
  plans: SubscriptionPlan[];
  currentSubscription: UserSubscription | null;
  currentPlan: SubscriptionPlan | null;
  loading: boolean;
  isPremium: boolean;
  checkout: (planId: string) => Promise<string>;
  cancelSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await (supabase
        .from("subscription_plans" as any)
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true }) as any);

      if (!error && data) {
        setPlans(data as SubscriptionPlan[]);
      }
    };

    fetchPlans();
  }, []);

  // Fetch user's subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setCurrentSubscription(null);
        setCurrentPlan(null);
        setLoading(false);
        return;
      }

      // Get active subscription
      const { data: subData, error: subError } = await (supabase
        .from("user_subscriptions" as any)
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single() as any);

      if (!subError && subData) {
        setCurrentSubscription(subData as UserSubscription);

        // Get the plan details
        const { data: planData } = await (supabase
          .from("subscription_plans" as any)
          .select("*")
          .eq("id", subData.plan_id)
          .single() as any);

        if (planData) {
          setCurrentPlan(planData as SubscriptionPlan);
        }
      } else {
        // No active subscription - check if they have any pending
        const { data: pendingData } = await (supabase
          .from("pending_payments" as any)
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .single() as any);

        if (pendingData) {
          // There's a pending payment - treat as active temporarily
          setCurrentSubscription({
            id: pendingData.id,
            user_id: user.id,
            plan_id: pendingData.plan_id,
            status: "pending",
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
          });
        }
      }

      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const checkout = async (planId: string): Promise<string> => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) throw new Error("Plan not found");

    // Free plan - no payment needed
    if (plan.price_monthly === 0) {
      // Create subscription directly
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await (supabase
        .from("user_subscriptions" as any)
        .upsert({
          user_id: user?.id,
          plan_id: planId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        }) as any);

      // Update profile
      await (supabase
        .from("profiles" as any)
        .update({
          subscription_tier: plan.name.toLowerCase(),
          subscription_status: "active",
          subscription_expires_at: periodEnd.toISOString(),
        })
        .eq("user_id", user?.id) as any);

      return "";
    }

    // Paid plan - redirect to Peach Payments
    const { data, error } = await supabase.functions.invoke("create-peach-checkout", {
      body: {
        planId,
        planName: plan.name,
        amount: plan.price_monthly_cents || Math.round(plan.price_monthly * 100),
        currency: "ZAR",
      },
    });

    if (error) throw error;
    return data.url;
  };

  const cancelSubscription = async () => {
    if (!currentSubscription) return;

    const { error } = await (supabase
      .from("user_subscriptions" as any)
      .update({ cancel_at_period_end: true })
      .eq("id", currentSubscription.id) as any);

    if (error) throw error;
  };

  const isPremium = currentPlan?.name.toLowerCase() === "premium" && 
    (currentSubscription?.status === "active" || currentSubscription?.status === "trialing");

  return (
    <SubscriptionContext.Provider
      value={{
        plans,
        currentSubscription,
        currentPlan,
        loading,
        isPremium,
        checkout,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
};
