import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Eye, Calendar, ArrowLeft, Lock, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import DonateButton from "@/components/DonateButton";
import Footer from "@/components/Footer";

interface FilmDetail {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  video_url: string | null;
  trailer_url: string | null;
  requires_auth: boolean;
  view_count: number;
  created_at: string;
  profiles: {
    id: string;
    display_name: string | null;
    username: string;
    bank_details: string | null;
    crypto_wallet: string | null;
    solana_wallet: string | null;
    bitcoin_wallet: string | null;
    show_bank_details: boolean;
    show_crypto_wallet: boolean;
    show_solana_wallet: boolean;
    show_bitcoin_wallet: boolean;
  };
}

const Watch = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [film, setFilm] = useState<FilmDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilm = async () => {
      const { data } = await supabase
        .from("films")
        .select("*")
        .eq("id", id!)
        .single();

      if (data) {
        // Fetch filmmaker from public_profiles view (masks financial data server-side)
        const { data: filmmaker } = await supabase
          .from("public_profiles" as any)
          .select("id, display_name, username, bank_details, crypto_wallet, solana_wallet, bitcoin_wallet, show_bank_details, show_crypto_wallet, show_solana_wallet, show_bitcoin_wallet")
          .eq("id", (data as any).filmmaker_id)
          .single();
        setFilm({ ...data, profiles: filmmaker } as any);
        // Increment view count
        await supabase.from("films").update({ view_count: (data.view_count || 0) + 1 }).eq("id", id!);
      }
      setLoading(false);
    };

    fetchFilm();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="font-display text-3xl">Film not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
          <ArrowLeft size={16} />
          Back to browse
        </Link>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Video Player */}
          {film.requires_auth && !user ? (
            <div className="aspect-video bg-muted border border-border mb-8 flex flex-col items-center justify-center gap-4">
              {film.trailer_url ? (
                <>
                  <p className="text-sm text-muted-foreground font-body">Trailer Preview</p>
                  <video
                    src={film.trailer_url}
                    controls
                    className="w-full h-full"
                    playsInline
                  />
                </>
              ) : (
                <>
                  <Lock size={48} className="text-muted-foreground" />
                  <p className="font-display text-xl font-bold">Sign in to watch</p>
                  <p className="text-sm text-muted-foreground font-body">This film requires an account to view</p>
                  <Link to="/auth" className="btn-outline-dark text-sm font-body mt-2">Sign In</Link>
                </>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-foreground border border-border mb-8">
              {film.video_url ? (
                <video
                  src={film.video_url}
                  controls
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full"
                  autoPlay={false}
                  playsInline
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-background font-body">
                  No video available
                </div>
              )}
            </div>
          )}

          {/* Trailer (shown below player for logged-in users if available) */}
          {film.trailer_url && user && (
            <details className="border border-border mb-8">
              <summary className="p-4 cursor-pointer font-body text-sm flex items-center gap-2 hover:bg-accent transition-colors">
                <Play size={16} />
                Watch Trailer
              </summary>
              <div className="aspect-video">
                <video src={film.trailer_url} controls className="w-full h-full" playsInline />
              </div>
            </details>
          )}

          {/* Film info */}
          <div className="border border-border p-6">
            <h1 className="font-display text-3xl font-bold mb-3">{film.title}</h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 font-body">
              <Link
                to={`/profile/${film.profiles.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {film.profiles.display_name || film.profiles.username}
              </Link>
              <div className="flex items-center gap-1">
                <Eye size={14} />
                {film.view_count} views
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(film.created_at).toLocaleDateString()}
              </div>
              {film.genre && (
                <span className="border border-border px-2 py-0.5">{film.genre}</span>
              )}
            </div>

            {film.description && (
              <p className="text-muted-foreground font-body leading-relaxed mb-4">{film.description}</p>
            )}

            <DonateButton
              bankDetails={film.profiles.show_bank_details ? film.profiles.bank_details : null}
              cryptoWallet={film.profiles.show_crypto_wallet ? film.profiles.crypto_wallet : null}
              solanaWallet={film.profiles.show_solana_wallet ? film.profiles.solana_wallet : null}
              bitcoinWallet={film.profiles.show_bitcoin_wallet ? film.profiles.bitcoin_wallet : null}
              filmmakerName={film.profiles.display_name || film.profiles.username}
            />
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Watch;
