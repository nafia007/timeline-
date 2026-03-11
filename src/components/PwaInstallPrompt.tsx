import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show manual instructions after a delay
    if (ios && !standalone) {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => {
          clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handler);
        };
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">Install Timeline</h3>
            {isIos ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap the share button <span className="inline-block text-base leading-none">⎋</span> then "Add to Home Screen" to install.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add Timeline to your home screen for quick access and an app-like experience.
              </p>
            )}
            {!isIos && (
              <Button size="sm" className="mt-2 h-8 text-xs" onClick={handleInstall}>
                Install App
              </Button>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
