import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Users, Film, UserPlus, UserMinus, Pencil, Trash2, Edit3, Plus, Smartphone } from "lucide-react";
import FilmCard from "@/components/FilmCard";
import VerticalFilmCard from "@/components/VerticalFilmCard";
import FilmEditForm from "@/components/FilmEditForm";
import FilmUploadForm from "@/components/FilmUploadForm";
import ProfileEditForm from "@/components/ProfileEditForm";
import DonationsTracker from "@/components/DonationsTracker";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  bank_details: string | null;
  crypto_wallet: string | null;
  solana_wallet: string | null;
  bitcoin_wallet: string | null;
  show_bank_details: boolean;
  show_crypto_wallet: boolean;
  show_solana_wallet: boolean;
  show_bitcoin_wallet: boolean;
}

interface FilmData {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  view_count: number;
  genre: string | null;
  is_vertical: boolean;
}

const Profile = () => {
  const { id } = useParams();
  const { profile: myProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [films, setFilms] = useState<FilmData[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingFilmId, setEditingFilmId] = useState<string | null>(null);
  const [deletingFilmId, setDeletingFilmId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const isOwnProfile = myProfile?.id === id;

  const fetchFilms = async () => {
    const { data: fData } = await supabase
      .from("films")
      .select("id, title, description, thumbnail_url, video_url, view_count, genre, is_vertical")
      .eq("filmmaker_id", id!)
      .order("created_at", { ascending: false });
    setFilms((fData as any as FilmData[]) || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      // Use public_profiles view to enforce show_bank_details/show_crypto_wallet server-side
      const { data: pData } = await supabase
        .from("public_profiles" as any)
        .select("*")
        .eq("id", id!)
        .single() as { data: any };
      setProfileData(pData as ProfileData | null);

      if (pData?.role === "filmmaker") {
        await fetchFilms();
      }

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id!);
      setFollowerCount(followers || 0);

      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id!);
      setFollowingCount(following || 0);

      if (myProfile && myProfile.id !== id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", myProfile.id)
          .eq("following_id", id!)
          .maybeSingle();
        setIsFollowing(!!followData);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, myProfile]);

  const handleFollow = async () => {
    if (!myProfile) return;
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", myProfile.id).eq("following_id", id!);
        setIsFollowing(false);
        setFollowerCount((c) => c - 1);
      } else {
        await supabase.from("follows").insert({ follower_id: myProfile.id, following_id: id! });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        // Send follow notification
        const actorName = myProfile.display_name || myProfile.username;
        await supabase.from("notifications").insert({
          recipient_id: id!,
          actor_id: myProfile.id,
          type: "follow",
          reference_id: myProfile.id,
          message: `${actorName} started following you`,
        });
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleDeleteFilm = async (filmId: string) => {
    try {
      const { error } = await supabase.from("films").delete().eq("id", filmId);
      if (error) throw error;
      setFilms((prev) => prev.filter((f) => f.id !== filmId));
      setDeletingFilmId(null);
      toast.success("Film deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

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

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="font-display text-3xl">Profile not found</h1>
        </div>
      </div>
    );
  }

  const editingFilm = editingFilmId ? films.find((f) => f.id === editingFilmId) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Profile header */}
          <div className="border border-border p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 border-2 border-foreground flex items-center justify-center text-2xl font-display font-bold shrink-0">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profileData.username[0]?.toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-3xl font-bold">
                  {profileData.display_name || profileData.username}
                </h1>
                <span className="text-xs border border-border px-2 py-0.5 text-muted-foreground font-body">
                  {profileData.role}
                </span>
              </div>
              <p className="text-muted-foreground font-body">@{profileData.username}</p>
              {profileData.bio && <p className="mt-2 text-sm font-body">{profileData.bio}</p>}

              <div className="flex items-center gap-6 mt-4 text-sm font-body">
                <div className="flex items-center gap-1.5">
                  <Users size={16} />
                  <span className="font-semibold">{followerCount}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{followingCount}</span>
                  <span className="text-muted-foreground">following</span>
                </div>
                {profileData.role === "filmmaker" && (
                  <div className="flex items-center gap-1.5">
                    <Film size={16} />
                    <span className="font-semibold">{films.length}</span>
                    <span className="text-muted-foreground">films</span>
                  </div>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <button onClick={() => setEditing(true)} className="btn-outline-dark flex items-center gap-2 font-body text-sm shrink-0">
                <Pencil size={16} />
                Edit
              </button>
            )}
            {!isOwnProfile && myProfile && (
              <button onClick={handleFollow} className="btn-outline-dark flex items-center gap-2 font-body text-sm shrink-0">
                {isFollowing ? <><UserMinus size={16} /> Unfollow</> : <><UserPlus size={16} /> Follow</>}
              </button>
            )}
          </div>

          {/* Edit profile form */}
          {editing && profileData && (
            <ProfileEditForm
              profileId={profileData.id}
              initialDisplayName={profileData.display_name || profileData.username}
              initialBio={profileData.bio || ""}
              initialAvatarUrl={profileData.avatar_url}
              initialBankDetails={profileData.bank_details || ""}
              initialCryptoWallet={profileData.crypto_wallet || ""}
              initialSolanaWallet={profileData.solana_wallet || ""}
              initialBitcoinWallet={profileData.bitcoin_wallet || ""}
              initialShowBankDetails={profileData.show_bank_details ?? true}
              initialShowCryptoWallet={profileData.show_crypto_wallet ?? true}
              initialShowSolanaWallet={profileData.show_solana_wallet ?? true}
              initialShowBitcoinWallet={profileData.show_bitcoin_wallet ?? true}
              isFilmmaker={profileData.role === "filmmaker"}
              onSaved={() => {
                setEditing(false);
                (supabase.from("public_profiles" as any).select("*").eq("id", id!).single() as unknown as Promise<{ data: any }>)
                  .then(({ data }) => setProfileData(data as ProfileData | null));
              }}
              onCancel={() => setEditing(false)}
            />
          )}

          {/* Film edit form */}
          {editingFilm && (
            <FilmEditForm
              filmId={editingFilm.id}
              profileId={profileData.id}
              initialTitle={editingFilm.title}
              initialDescription={editingFilm.description || ""}
              initialGenre={editingFilm.genre || ""}
              initialThumbnailUrl={editingFilm.thumbnail_url}
              initialVideoUrl={editingFilm.video_url}
              onSaved={() => {
                setEditingFilmId(null);
                fetchFilms();
              }}
              onCancel={() => setEditingFilmId(null)}
            />
          )}

          {/* Film upload form */}
          {showUpload && isOwnProfile && profileData.role === "filmmaker" && (
            <FilmUploadForm
              profileId={profileData.id}
              onUploaded={() => {
                setShowUpload(false);
                fetchFilms();
              }}
              onCancel={() => setShowUpload(false)}
            />
          )}

          {/* Films grid */}
          {profileData.role === "filmmaker" && (() => {
            const horizontalFilms = films.filter(f => !f.is_vertical);
            const verticalFilmsList = films.filter(f => f.is_vertical);
            return (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Films</h2>
                {isOwnProfile && !showUpload && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="btn-outline-dark flex items-center gap-2 font-body text-sm"
                  >
                    <Plus size={16} />
                    Upload Film
                  </button>
                )}
              </div>

              {/* Vertical Films / Reels */}
              {verticalFilmsList.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone size={16} className="text-primary" />
                    <h3 className="font-display text-lg font-semibold">Reels</h3>
                    <span className="text-xs text-muted-foreground font-body">Vertical</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {verticalFilmsList.map((film) => (
                      <div key={film.id} className="relative flex-shrink-0">
                        <VerticalFilmCard
                          id={film.id}
                          title={film.title}
                          thumbnailUrl={film.thumbnail_url}
                          filmmaker={profileData.display_name || profileData.username}
                          filmmakerProfileId={profileData.id}
                          viewCount={film.view_count}
                        />
                        {isOwnProfile && (
                          <div className="absolute top-2 right-2 flex gap-1 z-10">
                            <button
                              onClick={() => setEditingFilmId(film.id)}
                              className="bg-background/80 backdrop-blur border border-border p-1.5 hover:bg-accent transition-colors rounded"
                              title="Edit film"
                            >
                              <Edit3 size={12} />
                            </button>
                            {deletingFilmId === film.id ? (
                              <div className="flex gap-1">
                                <button onClick={() => handleDeleteFilm(film.id)} className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-body rounded">Confirm</button>
                                <button onClick={() => setDeletingFilmId(null)} className="bg-background border border-border text-xs px-2 py-1 font-body rounded">Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingFilmId(film.id)}
                                className="bg-background/80 backdrop-blur border border-border p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors rounded"
                                title="Delete film"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Horizontal Films */}
              {horizontalFilms.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {horizontalFilms.map((film) => (
                    <div key={film.id} className="relative">
                      <FilmCard
                        id={film.id}
                        title={film.title}
                        thumbnailUrl={film.thumbnail_url}
                        filmmaker={profileData.display_name || profileData.username}
                        filmmakerProfileId={profileData.id}
                        viewCount={film.view_count}
                        genre={film.genre}
                      />
                      {isOwnProfile && (
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                          <button
                            onClick={() => setEditingFilmId(film.id)}
                            className="bg-background border border-border p-1.5 hover:bg-accent transition-colors"
                            title="Edit film"
                          >
                            <Edit3 size={14} />
                          </button>
                          {deletingFilmId === film.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDeleteFilm(film.id)} className="bg-destructive text-destructive-foreground text-xs px-2 py-1 font-body">Confirm</button>
                              <button onClick={() => setDeletingFilmId(null)} className="bg-background border border-border text-xs px-2 py-1 font-body">Cancel</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingFilmId(film.id)}
                              className="bg-background border border-border p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              title="Delete film"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : verticalFilmsList.length === 0 ? (
                <div className="border border-dashed border-border p-16 text-center">
                  <p className="text-muted-foreground font-body">No films yet</p>
                </div>
              ) : null}
            </>
            );
          })()}

          {/* Donations tracker - only visible to own profile filmmakers */}
          {isOwnProfile && profileData.role === "filmmaker" && (
            <DonationsTracker profileId={profileData.id} />
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
