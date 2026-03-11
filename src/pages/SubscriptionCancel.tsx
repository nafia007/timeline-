import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Payment Cancelled
          </h1>
          <p className="text-muted-foreground font-body mb-6">
            Your payment was cancelled. You can still continue with a free account or try again later.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="btn-outline-dark"
            >
              Go to Home
            </button>
            <button
              onClick={() => navigate("/subscription")}
              className="btn-dark"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default SubscriptionCancel;
