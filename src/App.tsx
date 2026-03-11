import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import Index from "./pages/Index";
import Auth from "./pages/Auth";

import Watch from "./pages/Watch";
import Reels from "./pages/Reels";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Filmmakers from "./pages/Filmmakers";
import Feed from "./pages/Feed";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PwaInstallPrompt />
        <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
              <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/reels/:id?" element={<Reels />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/filmmakers" element={<Filmmakers />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
