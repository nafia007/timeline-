import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { motion } from "framer-motion";
import { Film, Eye } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import SubscriptionPlanSelection from "@/components/SubscriptionPlanSelection";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"filmmaker" | "viewer">("viewer");
  const [submitting, setSubmitting] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the reset link");
    }
    setSubmitting(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password, username, role);
        toast.success("Check your email to confirm your account");
        // For email confirmation flow, show subscription after confirmation
        // Check if email confirmation is required
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // Email confirmation required - show subscription after they confirm
          setShowSubscription(true);
        }
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background items-center justify-center p-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-6xl font-bold mb-6">TIMELINE</h1>
          <p className="text-lg opacity-70 max-w-md font-body">
            A platform for independent filmmakers to share their work and build an audience.
          </p>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <h2 className="font-display text-4xl font-bold mb-2">
            {isForgotPassword ? "Reset Password" : isSignUp ? "Join TIMELINE" : "Welcome back"}
          </h2>
          <p className="text-muted-foreground mb-8 font-body">
            {isForgotPassword
              ? "Enter your email to receive a reset link"
              : isSignUp
              ? "Create your account"
              : "Sign in to continue"}
          </p>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-minimal font-body"
              />
              <button type="submit" disabled={submitting} className="btn-outline-dark w-full font-body">
                {submitting ? "..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input-minimal font-body"
                  />
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setRole("filmmaker")}
                      className={`flex-1 border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                        role === "filmmaker"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      <Film size={24} />
                      <span className="text-sm font-medium font-body">Filmmaker</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("viewer")}
                      className={`flex-1 border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                        role === "viewer"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      <Eye size={24} />
                      <span className="text-sm font-medium font-body">Viewer</span>
                    </button>
                  </div>
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-minimal font-body"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-minimal font-body"
              />

              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-foreground underline font-body"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-outline-dark w-full font-body">
                {submitting ? "..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>
          )}

          {showSubscription && (
            <div className="mt-8">
              <SubscriptionPlanSelection
                onComplete={() => {
                  navigate("/");
                }}
                onSkip={() => {
                  navigate("/");
                }}
              />
            </div>
          )}

          {!showSubscription && (
            <>
          <p className="mt-6 text-center text-sm text-muted-foreground font-body">
            {isForgotPassword ? (
              <button
                onClick={() => setIsForgotPassword(false)}
                className="underline text-foreground font-medium"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="underline text-foreground font-medium"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </>
            )}
          </p>
            </>
          )}
        </motion.div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
