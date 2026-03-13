import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FilmCard from "@/components/FilmCard";
import VerticalFilmCard from "@/components/VerticalFilmCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Play, Smartphone } from "lucide-react";

interface FilmWithProfile {
  id: string;
  title: string;
  thumbnail_url: string | null;
  view_count: number;
  genre: string | null;
  is_vertical: boolean;
  public_profiles: {
    id: string;
    display_name: string | null;
    username: string;
  };
}

const GENRES = ["All", "Drama", "Comedy", "Horror", "Documentary", "Sci-Fi", "Animation", "Thriller", "Romance", "Action", "Experimental"];

const Index = () => {
  const [films, setFilms] = useState<FilmWithProfile[]>([]);
  const [verticalFilms, setVerticalFilms] = useState<FilmWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");

  useEffect(() => {
    const fetchFilms = async () => {
      // Fetch vertical films (reels)
      const { data: vData } = await supabase
        .from("films")
        .select("id, title, thumbnail_url, view_count, genre, is_vertical, public_profiles!films_filmmaker_id_fkey(id, display_name, username)")
        .eq("is_vertical", true)
        .order("created_at", { ascending: false })
        .limit(20);
      setVerticalFilms((vData as any) || []);

      // Fetch horizontal films
      let query = supabase
        .from("films")
        .select("id, title, thumbnail_url, view_count, genre, is_vertical, public_profiles!films_filmmaker_id_fkey(id, display_name, username)")
        .eq("is_vertical", false)
        .order("created_at", { ascending: false });

      if (activeGenre !== "All") {
        query = query.eq("genre", activeGenre);
      }

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data } = await query;
      setFilms((data as any) || []);
      setLoading(false);
    };

    fetchFilms();
  }, [activeGenre, search]);

  const heroFilm = films[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Beta Banner */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-body">
        🎉 Beta Access — Free for the first 2 months before official launch!
      </div>

      {/* Hero — featured film */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-body mb-4">
                Independent Cinema
              </p>
              <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-5 leading-[0.95]">
                Discover
                <br />
                Bold New
                <br />
                Voices
              </h1>
              <p className="text-base text-muted-foreground max-w-sm font-body mb-8">
                A platform for emerging filmmakers to upload, share, and build their audience. Support creators directly.
              </p>
              <Link to="/filmmakers" className="btn-outline-dark inline-block text-sm font-body">
                Explore Filmmakers
              </Link>
            </div>

            {/* Featured film card */}
            {heroFilm ? (
              <Link to={`/watch/${heroFilm.id}`} className="group block">
              <div className="aspect-[2/3] sm:aspect-[16/10] bg-muted border border-border relative overflow-hidden">
                  {heroFilm.thumbnail_url ? (
                    <img
                      src={heroFilm.thumbnail_url}
                      alt={heroFilm.title}
                      className="w-full h-full object-contain bg-muted transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play size={64} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs uppercase tracking-wider font-body text-background/70 mb-1 block">
                      Featured
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-background">
                      {heroFilm.title}
                    </h2>
                    <p className="text-sm text-background/80 font-body mt-1">
                      by {heroFilm.public_profiles?.display_name || heroFilm.public_profiles?.username || "Unknown"}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="aspect-[16/10] border border-dashed border-border flex items-center justify-center">
                <p className="text-muted-foreground font-body">No films yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Vertical Films / Reels Section */}
      {verticalFilms.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-primary" />
                <h2 className="font-display text-xl font-bold">Reels</h2>
                <span className="text-xs text-muted-foreground font-body ml-1">Vertical Films</span>
              </div>
              <Link to="/reels" className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors">
                View all →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
              {verticalFilms.map((film) => (
                <VerticalFilmCard
                  key={film.id}
                  id={film.id}
                  title={film.title}
                  thumbnailUrl={film.thumbnail_url}
                  filmmaker={film.public_profiles?.display_name || film.public_profiles?.username || "Unknown"}
                  filmmakerProfileId={film.public_profiles?.id || ""}
                  viewCount={film.view_count}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search films..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-minimal pl-7 text-sm font-body border-b"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={`text-xs px-3 py-1.5 border transition-all font-body ${
                    activeGenre === g
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Films Grid — larger cards */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin" />
          </div>
        ) : films.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {films.map((film) => (
              <FilmCard
                key={film.id}
                id={film.id}
                title={film.title}
                thumbnailUrl={film.thumbnail_url}
                filmmaker={film.public_profiles?.display_name || film.public_profiles?.username || "Unknown"}
                filmmakerProfileId={film.public_profiles?.id || ""}
                viewCount={film.view_count}
                genre={film.genre}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed border-border p-20 text-center"
          >
            <p className="font-display text-2xl mb-2">No films yet</p>
            <p className="text-muted-foreground font-body">Be the first to upload a film</p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
