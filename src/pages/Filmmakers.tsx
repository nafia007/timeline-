import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Film, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import DonateButton from "@/components/DonateButton";
import Footer from "@/components/Footer";

interface FilmPreview {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

interface FeaturedFilmmaker {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  bank_details: string | null;
  crypto_wallet: string | null;
  solana_wallet: string | null;
  bitcoin_wallet: string | null;
  show_bank_details: boolean;
  show_crypto_wallet: boolean;
  show_solana_wallet: boolean;
  show_bitcoin_wallet: boolean;
  film_count: number;
  follower_count: number;
  latest_films: FilmPreview[];
}

const Filmmakers = () => {
  const [filmmakers, setFilmmakers] = useState<FeaturedFilmmaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data: profiles } = await supabase
        .from("public_profiles" as any)
        .select("id, username, display_name, bio, avatar_url, bank_details, crypto_wallet, solana_wallet, bitcoin_wallet, show_bank_details, show_crypto_wallet, show_solana_wallet, show_bitcoin_wallet")
        .eq("role", "filmmaker")
        .eq("featured_filmmaker", true)
        .order("display_name") as { data: any[] | null };

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }

      const enriched = await Promise.all(
        profiles.map(async (p) => {
          const [{ count: filmCount }, { count: followerCount }, { data: latestFilms }] = await Promise.all([
            supabase
              .from("films")
              .select("*", { count: "exact", head: true })
              .eq("filmmaker_id", p.id)
              .eq("status", "approved"),
            supabase
              .from("follows")
              .select("*", { count: "exact", head: true })
              .eq("following_id", p.id),
            supabase
              .from("films")
              .select("id, title, thumbnail_url")
              .eq("filmmaker_id", p.id)
              .eq("status", "approved")
              .order("created_at", { ascending: false })
              .limit(3),
          ]);

          return {
            ...p,
            film_count: filmCount || 0,
            follower_count: followerCount || 0,
            latest_films: (latestFilms as FilmPreview[]) || [],
          } as FeaturedFilmmaker;
        })
      );

      setFilmmakers(enriched);
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-5xl font-bold tracking-tight mb-3">Filmmakers</h1>
          <p className="text-muted-foreground font-body mb-12 max-w-lg">
            Discover featured independent filmmakers on TIMELINE.
          </p>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin" />
            </div>
          ) : filmmakers.length === 0 ? (
            <div className="border border-dashed border-border p-16 text-center">
              <p className="text-muted-foreground font-body">No featured filmmakers yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filmmakers.map((fm, i) => (
                <motion.div
                  key={fm.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link
                    to={`/profile/${fm.id}`}
                    className="block border border-border p-6 hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center text-xl font-display font-bold shrink-0 overflow-hidden">
                        {fm.avatar_url ? (
                          <img src={fm.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          fm.username[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-xl font-bold">
                          {fm.display_name || fm.username}
                        </h3>
                        <p className="text-sm text-muted-foreground font-body">@{fm.username}</p>
                      </div>
                    </div>

                    {fm.bio && (
                      <p className="text-sm text-muted-foreground font-body mb-4 line-clamp-2">
                        {fm.bio}
                      </p>
                    )}

                    {/* Latest films */}
                    {fm.latest_films.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2">Latest Films</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {fm.latest_films.map((film) => (
                            <div key={film.id} className="aspect-video bg-muted border border-border overflow-hidden">
                              {film.thumbnail_url ? (
                                <img src={film.thumbnail_url} alt={film.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film size={12} className="text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
                        <div className="flex items-center gap-1">
                          <Film size={14} />
                          <span>{fm.film_count} films</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{fm.follower_count} followers</span>
                        </div>
                      </div>
                      <DonateButton
                        bankDetails={fm.show_bank_details ? fm.bank_details : null}
                        cryptoWallet={fm.show_crypto_wallet ? fm.crypto_wallet : null}
                        solanaWallet={fm.show_solana_wallet ? fm.solana_wallet : null}
                        bitcoinWallet={fm.show_bitcoin_wallet ? fm.bitcoin_wallet : null}
                        filmmakerName={fm.display_name || fm.username}
                        variant="compact"
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Filmmakers;
