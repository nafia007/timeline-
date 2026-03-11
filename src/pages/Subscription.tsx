import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Check, Crown, Calendar, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { plans as localPlans, type Plan } from "@/config/plans";

const Subscription = () => {
  const { user } = useAuth();
  const { currentSubscription, currentPlan, loading, isPremium, checkout, cancelSubscription } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  // Use local plans if database plans aren't loaded yet
  const displayPlans: Plan[] = localPlans;

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access at the end of your billing period.")) {
      return;
    }

    setCanceling(true);
    try {
      await cancelSubscription();
      toast.success("Your subscription will be cancelled at the end of the billing period");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel subscription");
    } finally {
      setCanceling(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      const checkoutUrl = await checkout(planId);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start upgrade");
      setUpgrading(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground font-body mb-4">
              Please sign in to manage your subscription.
            </p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isCurrentPlanPremium = currentPlan?.name?.toLowerCase() === "premium";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-4xl font-bold mb-2">Subscription</h1>
            <p className="text-muted-foreground font-body mb-8">
              Manage your subscription and billing
            </p>

            {/* Current Plan */}
            <div className="border-2 border-border rounded-xl p-6 mb-8 bg-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold flex items-center gap-2">
                    {currentPlan ? (
                      <>
                        {currentPlan.name} Plan
                        {isCurrentPlanPremium && <Crown className="text-yellow-500" size={20} />}
                      </>
                    ) : (
                      "Free Plan"
                    )}
                  </h2>
                  {currentSubscription?.current_period_end && (
                    <p className="text-sm text-muted-foreground font-body mt-1 flex items-center gap-1">
                      <Calendar size={14} />
                      {currentSubscription.cancel_at_period_end
                        ? `Cancels on ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`
                        : `Renews on ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`}
                    </p>
                  )}
                  {!currentPlan && (
                    <p className="text-sm text-muted-foreground font-body mt-1">
                      Current plan: Free
                    </p>
                  )}
                </div>
                {isPremium && (
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                )}
              </div>

              {isPremium && currentSubscription?.cancel_at_period_end && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Subscription Ending</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-body">
                      Your subscription will end on {new Date(currentSubscription.current_period_end!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {isPremium && !currentSubscription?.cancel_at_period_end && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={canceling}
                >
                  {canceling ? "Processing..." : "Cancel Subscription"}
                </Button>
              )}
            </div>

            {/* Available Plans */}
            <h3 className="font-display text-2xl font-bold mb-4">Available Plans</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {displayPlans.map((plan, index) => {
                const isCurrentPlan = currentPlan?.id === plan.id;
                const isFree = plan.price === 0;
                const isPremiumPlan = plan.highlighted;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 rounded-xl p-6 relative ${
                      isCurrentPlan
                        ? "border-primary bg-primary/5"
                        : isPremiumPlan
                        ? "border-primary"
                        : "border-border"
                    }`}
                  >
                    {isPremiumPlan && !isCurrentPlan && (
                      <div className="bg-primary text-primary-foreground -mx-6 -mt-6 px-6 py-2 rounded-t-xl flex items-center gap-1">
                        <Crown size={14} />
                        <span className="text-sm font-medium">Most Popular</span>
                      </div>
                    )}

                    <h4 className="font-display text-xl font-bold mb-1">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground font-body mb-4">
                      {plan.interval === "month" ? "Monthly billing" : "Yearly billing"}
                    </p>

                    <div className="mb-4">
                      <span className="font-display text-4xl font-bold">
                        {isFree ? "Free" : `R${plan.price}`}
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
                            className={`mt-0.5 flex-shrink-0 ${isPremiumPlan ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span className="font-body">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {loading || upgrading === plan.id ? (
                      <Button className="w-full" disabled>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Processing...
                      </Button>
                    ) : isCurrentPlan ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : isFree ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        Downgrade to Free
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        <Sparkles size={16} className="mr-2" />
                        {isPremium ? "Switch to " : "Upgrade to "}{plan.name}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Payment Info */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Payments are securely processed by Peach Payments</p>
              <p className="mt-1">You can cancel anytime from your account settings</p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Subscription;
