import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/config/plans";

interface CheckoutResult {
  redirectUrl: string;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = async (plan: Plan) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<CheckoutResult>(
        "create-checkout",
        {
          body: {
            planId: plan.id,
            amount: plan.price.toFixed(2),
            currency: plan.currency,
            returnUrl: window.location.origin,
          },
        }
      );

      if (fnError) throw new Error(fnError.message);
      if (!data?.redirectUrl) throw new Error("No checkout URL returned");

      // Redirect to Peach Payments hosted checkout
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message || "Failed to initiate checkout");
      setLoading(false);
    }
  };

  return { initiateCheckout, loading, error };
}
