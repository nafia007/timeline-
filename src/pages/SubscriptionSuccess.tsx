import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Check if we have a user_id from the URL (after Peach redirect)
          const userId = searchParams.get("user_id");
          if (userId) {
            // The webhook should have already processed this
            // Just wait a moment and redirect
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // Fetch the latest subscription status
        const { data: subscription } = await (supabase
          .from("user_subscriptions" as any)
          .select("*")
          .eq("user_id", user?.id || searchParams.get("user_id"))
          .in("status", ["active", "trialing"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single() as any);

        if (subscription) {
          setStatus("success");
          // Redirect to home after 3 seconds
          setTimeout(() => navigate("/"), 3000);
        } else {
          // Check pending payments
          const { data: pending } = await (supabase
            .from("pending_payments" as any)
            .select("*")
            .eq("user_id", user?.id || searchParams.get("user_id"))
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .single() as any);

          if (pending) {
            // Payment is still being processed
            setStatus("processing");
          } else {
            setStatus("success");
          }
        }
      } catch (error) {
        console.error("Error verifying subscription:", error);
        setStatus("error");
      }
    };

    verifySubscription();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          {status === "processing" && (
            <>
              <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-foreground" />
              <h1 className="font-display text-2xl font-bold mb-2">
                Processing Payment...
              </h1>
              <p className="text-muted-foreground font-body">
                Please wait while we confirm your payment. This may take a moment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h1 className="font-display text-2xl font-bold mb-2">
                Welcome to Timeline Premium!
              </h1>
              <p className="text-muted-foreground font-body">
                Your subscription is now active. Redirecting you to the home page...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500 text-2xl">✕</span>
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">
                Something Went Wrong
              </h1>
              <p className="text-muted-foreground font-body mb-4">
                We couldn't verify your payment. Please check your email or try again.
              </p>
              <button
                onClick={() => navigate("/")}
                className="btn-outline-dark"
              >
                Go to Home
              </button>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default SubscriptionSuccess;
