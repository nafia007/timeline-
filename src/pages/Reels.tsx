import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowLeft, Eye, Heart, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown } from "lucide-react";

interface ReelFilm {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  view_count: number;
  filmmaker_id: string;
  public_profiles: {
    id: string;
    display_name: string | null;
    username: string;
  };
}

const Reels = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reels, setReels] = useState<ReelFilm[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const controlsTimer = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReels = async () => {
      const { data } = await supabase
        .from("films")
        .select("id, title, description, video_url, thumbnail_url, view_count, filmmaker_id, public_profiles!films_filmmaker_id_fkey(id, display_name, username)")
        .eq("is_vertical", true)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50);

      const films = (data as any) || [];
      setReels(films);

      if (id) {
        const idx = films.findIndex((f: ReelFilm) => f.id === id);
        if (idx >= 0) setCurrentIndex(idx);
      }
      setLoading(false);
    };
    fetchReels();
  }, [id]);

  // Play current video, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (idx === currentIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    // Update URL
    if (reels[currentIndex]) {
      navigate(`/reels/${reels[currentIndex].id}`, { replace: true });
      // Increment view
      supabase.from("films").update({ view_count: (reels[currentIndex].view_count || 0) + 1 }).eq("id", reels[currentIndex].id);
    }
  }, [currentIndex, reels, navigate]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, reels.length - 1));
  }, [reels.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") goNext();
      if (e.key === "ArrowUp" || e.key === "k") goPrev();
      if (e.key === " ") { e.preventDefault(); togglePlay(); }
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Wheel navigation
  useEffect(() => {
    let cooldown = false;
    const handler = (e: WheelEvent) => {
      if (cooldown) return;
      cooldown = true;
      setTimeout(() => (cooldown = false), 600);
      if (e.deltaY > 0) goNext();
      else goPrev();
    };
    const el = containerRef.current;
    el?.addEventListener("wheel", handler, { passive: true });
    return () => el?.removeEventListener("wheel", handler);
  }, [goNext, goPrev]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -80) goNext();
    else if (info.offset.y > 80) goPrev();
  };

  const togglePlay = () => {
    const video = videoRefs.current.get(currentIndex);
    if (!video) return;
    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const handleTap = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const currentReel = reels[currentIndex];

  if (loading) {
    return (
      <div className="h-dvh bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-dvh bg-black flex flex-col items-center justify-center text-white gap-4">
        <p className="font-display text-xl">No reels yet</p>
        <Link to="/" className="text-sm text-white/60 hover:text-white underline">Go back</Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-dvh bg-black overflow-hidden relative select-none" onClick={handleTap}>
      {/* Back button */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-4 z-50"
          >
            <button onClick={() => navigate("/")} className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
              <ArrowLeft size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation hints */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
          >
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === reels.length - 1}
              className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white disabled:opacity-30 hover:bg-black/60 transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipeable video area */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="h-full w-full"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentReel.id}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Video */}
            <div className="relative h-full w-full max-w-[500px] mx-auto">
              {currentReel.video_url ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(currentIndex, el);
                  }}
                  src={currentReel.video_url}
                  className="h-full w-full object-contain"
                  loop
                  muted={muted}
                  playsInline
                  autoPlay
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  {currentReel.thumbnail_url ? (
                    <img src={currentReel.thumbnail_url} alt={currentReel.title} className="h-full w-full object-contain" />
                  ) : (
                    <Play size={64} className="text-white/40" />
                  )}
                </div>
              )}

              {/* Pause indicator */}
              <AnimatePresence>
                {paused && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="p-5 rounded-full bg-black/40 backdrop-blur-sm">
                      <Pause size={40} className="text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <h2 className="font-display text-lg font-bold text-white mb-1 drop-shadow-lg">
                  {currentReel.title}
                </h2>
                <Link
                  to={`/profile/${currentReel.public_profiles?.id}`}
                  className="text-sm text-white/80 hover:text-white font-body drop-shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{currentReel.public_profiles?.display_name || currentReel.public_profiles?.username}
                </Link>
                {currentReel.description && (
                  <p className="text-xs text-white/60 font-body mt-2 line-clamp-2 drop-shadow">
                    {currentReel.description}
                  </p>
                )}
              </div>

              {/* Side controls */}
              <div className="absolute right-3 bottom-28 flex flex-col gap-5 items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
                  className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="flex flex-col items-center gap-1">
                  <Eye size={20} className="text-white/80" />
                  <span className="text-xs text-white/70 font-body">{currentReel.view_count}</span>
                </div>
              </div>

              {/* Progress dots */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
                {reels.slice(Math.max(0, currentIndex - 3), Math.min(reels.length, currentIndex + 4)).map((r, i) => {
                  const actualIdx = Math.max(0, currentIndex - 3) + i;
                  return (
                    <div
                      key={r.id}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        actualIdx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Reels;
