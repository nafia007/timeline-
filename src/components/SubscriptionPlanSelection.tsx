import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SubscriptionPlanSelectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const SubscriptionPlanSelection = ({ onComplete, onSkip }: SubscriptionPlanSelectionProps) => {
  const { plans, checkout, loading, isPremium } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    setProcessing(true);

    try {
      const checkoutUrl = await checkout(planId);

      if (checkoutUrl) {
        // Redirect to Peach Payments checkout
        window.location.href = checkoutUrl;
      } else {
        // Free plan - no redirect needed
        toast.success("Welcome to Timeline!");
        onComplete?.();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start subscription");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground font-body">
          Select the plan that works best for you
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan, index) => {
          const isFree = plan.price_monthly === 0;
          const isPremium = plan.name.toLowerCase() === "premium";

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative border-2 rounded-xl p-6 transition-all ${
                isPremium
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/50"
              }`}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown size={14} />
                  Most Popular
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 font-body">
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <span className="font-display text-4xl font-bold">
                  {isFree ? "Free" : `R${plan.price_monthly}`}
                </span>
                {!isFree && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 ${isPremium ? "text-foreground" : "text-muted-foreground"}`}
                    />
                    <span className="font-body">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  isPremium ? "" : "variant-outline"
                }`}
                disabled={processing || selectedPlan === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {processing && selectedPlan === plan.id ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : isFree ? (
                  "Get Started Free"
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {onSkip && (
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground underline font-body"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlanSelection;
