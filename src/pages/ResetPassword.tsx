import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      navigate("/");
    }
    setSubmitting(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Invalid Link</h1>
            <p className="text-muted-foreground font-body mb-6">
              This password reset link is invalid or has expired.
            </p>
            <button onClick={() => navigate("/auth")} className="btn-outline-dark font-body">
              Back to Sign In
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="font-display text-4xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground mb-8 font-body">Enter your new password below.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-minimal font-body"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="input-minimal font-body"
            />
            <button type="submit" disabled={submitting} className="btn-outline-dark w-full font-body">
              {submitting ? "..." : "Update Password"}
            </button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
