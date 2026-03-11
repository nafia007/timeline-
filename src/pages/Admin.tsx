import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Film, Users, Eye, CheckCircle, XCircle, Clock, Star, ExternalLink, Lock, Unlock, Video } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProfileRow {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  role: string;
  created_at: string;
  avatar_url: string | null;
  featured_filmmaker: boolean;
}

interface FilmRow {
  id: string;
  title: string;
  genre: string | null;
  view_count: number;
  created_at: string;
  filmmaker_id: string;
  status: string;
  trailer_url: string | null;
  requires_auth: boolean;
  profiles: { username: string; display_name: string | null } | null;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [films, setFilms] = useState<FilmRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [filmSearch, setFilmSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [editingTrailerId, setEditingTrailerId] = useState<string | null>(null);
  const [trailerInput, setTrailerInput] = useState("");

  // Check admin role
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!data) {
        navigate("/");
        toast.error("Access denied");
      } else {
        setIsAdmin(true);
      }
      setChecking(false);
    };
    checkAdmin();
  }, [user, authLoading, navigate]);

  // Fetch data
  useEffect(() => {
    if (!isAdmin) return;
    const fetchAll = async () => {
      const [usersRes, filmsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase
          .from("films")
          .select("id, title, genre, view_count, created_at, filmmaker_id, status, trailer_url, requires_auth, profiles!films_filmmaker_id_fkey(username, display_name)")
          .order("created_at", { ascending: false }),
      ]);
      setUsers(usersRes.data || []);
      setFilms((filmsRes.data as any) || []);
      setLoadingData(false);
    };
    fetchAll();
  }, [isAdmin]);

  const deleteFilm = async (id: string, title: string) => {
    if (!confirm(`Delete film "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("films").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete film");
    } else {
      setFilms((prev) => prev.filter((f) => f.id !== id));
      toast.success("Film deleted");
    }
  };

  const updateFilmStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("films").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      setFilms((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
      toast.success(`Film ${status}`);
    }
  };

  const toggleRequiresAuth = async (film: FilmRow) => {
    const newValue = !film.requires_auth;
    const { error } = await supabase.from("films").update({ requires_auth: newValue }).eq("id", film.id);
    if (error) {
      toast.error("Failed to update");
    } else {
      setFilms((prev) => prev.map((f) => (f.id === film.id ? { ...f, requires_auth: newValue } : f)));
      toast.success(newValue ? "Film now requires login" : "Film is now public");
    }
  };

  const updateTrailerUrl = async (filmId: string, trailerUrl: string) => {
    const { error } = await supabase.from("films").update({ trailer_url: trailerUrl || null }).eq("id", filmId);
    if (error) {
      toast.error("Failed to update trailer");
    } else {
      setFilms((prev) => prev.map((f) => (f.id === filmId ? { ...f, trailer_url: trailerUrl || null } : f)));
      toast.success("Trailer updated");
    }
  };

  const deleteUser = async (profile: ProfileRow) => {
    if (!confirm(`Delete user "${profile.username}"? Their films will remain.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", profile.id);
    if (error) {
      toast.error("Failed to delete profile");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== profile.id));
      toast.success("Profile deleted");
    }
  };

  const toggleFeatured = async (profile: ProfileRow) => {
    const newValue = !profile.featured_filmmaker;
    const { error } = await supabase
      .from("profiles")
      .update({ featured_filmmaker: newValue })
      .eq("id", profile.id);
    if (error) {
      toast.error("Failed to update");
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === profile.id ? { ...u, featured_filmmaker: newValue } : u))
      );
      toast.success(newValue ? "Filmmaker featured" : "Filmmaker unfeatured");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.display_name || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredFilms = films.filter((f) =>
    f.title.toLowerCase().includes(filmSearch.toLowerCase())
  );

  const pendingFilms = filteredFilms.filter((f) => f.status === "pending");
  const otherFilms = filteredFilms.filter((f) => f.status !== "pending");

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-foreground border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="font-body text-xs bg-green-600 text-white">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="font-body text-xs">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="font-body text-xs"><Clock size={12} className="mr-1" />Pending</Badge>;
    }
  };


  const FilmTableRows = ({ filmList }: { filmList: FilmRow[] }) => (
    <>
      {filmList.map((f) => (
        <TableRow key={f.id}>
          <TableCell className="font-body font-medium">
            <button onClick={() => navigate(`/watch/${f.id}`)} className="hover:underline">
              {f.title}
            </button>
          </TableCell>
          <TableCell className="font-body">
            {f.profiles?.display_name || f.profiles?.username || "Unknown"}
          </TableCell>
          <TableCell>
            {f.genre ? <Badge variant="outline" className="font-body text-xs">{f.genre}</Badge> : "—"}
          </TableCell>
          <TableCell>{statusBadge(f.status)}</TableCell>
          <TableCell className="font-body">{f.view_count.toLocaleString()}</TableCell>
          <TableCell>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleRequiresAuth(f)}
                title={f.requires_auth ? "Remove login requirement" : "Require login to watch"}
              >
                {f.requires_auth ? <Lock size={16} className="text-destructive" /> : <Unlock size={16} className="text-muted-foreground" />}
              </Button>
              {editingTrailerId === f.id ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={trailerInput}
                    onChange={(e) => setTrailerInput(e.target.value)}
                    placeholder="Trailer URL"
                    className="h-7 text-xs w-40 font-body"
                  />
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { updateTrailerUrl(f.id, trailerInput); setEditingTrailerId(null); }}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingTrailerId(null)}>✕</Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setEditingTrailerId(f.id); setTrailerInput(f.trailer_url || ""); }}
                  title={f.trailer_url ? "Edit trailer" : "Add trailer"}
                >
                  <Video size={16} className={f.trailer_url ? "text-primary" : "text-muted-foreground"} />
                </Button>
              )}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              {f.status !== "approved" && (
                <Button variant="ghost" size="icon" onClick={() => updateFilmStatus(f.id, "approved")} title="Approve">
                  <CheckCircle size={16} className="text-green-600" />
                </Button>
              )}
              {f.status !== "rejected" && (
                <Button variant="ghost" size="icon" onClick={() => updateFilmStatus(f.id, "rejected")} title="Reject">
                  <XCircle size={16} className="text-orange-500" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => deleteFilm(f.id, f.title)} className="text-destructive hover:text-destructive">
                <Trash2 size={16} />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6 py-10"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <Link to="/filmmakers" className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-body hover:bg-accent transition-colors">
            <Star size={16} />
            View Showcase
            <ExternalLink size={14} />
          </Link>
        </div>
        <p className="text-muted-foreground font-body mb-8">Manage platform users and films</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users size={16} />
              <span className="text-xs font-body uppercase tracking-wider">Users</span>
            </div>
            <p className="font-display text-3xl font-bold">{users.length}</p>
          </div>
          <div className="border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Film size={16} />
              <span className="text-xs font-body uppercase tracking-wider">Films</span>
            </div>
            <p className="font-display text-3xl font-bold">{films.length}</p>
          </div>
          <div className="border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock size={16} />
              <span className="text-xs font-body uppercase tracking-wider">Pending</span>
            </div>
            <p className="font-display text-3xl font-bold">{films.filter((f) => f.status === "pending").length}</p>
          </div>
          <div className="border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye size={16} />
              <span className="text-xs font-body uppercase tracking-wider">Total Views</span>
            </div>
            <p className="font-display text-3xl font-bold">
              {films.reduce((sum, f) => sum + f.view_count, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="font-body">
              Pending Approval {pendingFilms.length > 0 && `(${pendingFilms.length})`}
            </TabsTrigger>
            <TabsTrigger value="films" className="font-body">All Films</TabsTrigger>
            <TabsTrigger value="users" className="font-body">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loadingData ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-foreground border-t-transparent animate-spin" />
              </div>
            ) : pendingFilms.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 font-body">
                No films awaiting approval
              </div>
            ) : (
              <div className="border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body">Title</TableHead>
                      <TableHead className="font-body">Filmmaker</TableHead>
                      <TableHead className="font-body">Genre</TableHead>
                      <TableHead className="font-body">Status</TableHead>
                      <TableHead className="font-body">Views</TableHead>
                      <TableHead className="font-body">Controls</TableHead>
                      <TableHead className="font-body text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <FilmTableRows filmList={pendingFilms} />
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="films">
            <div className="relative max-w-sm mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search films..."
                value={filmSearch}
                onChange={(e) => setFilmSearch(e.target.value)}
                className="pl-9 font-body"
              />
            </div>
            {loadingData ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-foreground border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body">Title</TableHead>
                      <TableHead className="font-body">Filmmaker</TableHead>
                      <TableHead className="font-body">Genre</TableHead>
                      <TableHead className="font-body">Status</TableHead>
                      <TableHead className="font-body">Views</TableHead>
                      <TableHead className="font-body">Controls</TableHead>
                      <TableHead className="font-body text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <FilmTableRows filmList={filteredFilms} />
                    {filteredFilms.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8 font-body">
                          No films found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <div className="relative max-w-sm mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 font-body"
              />
            </div>
            {loadingData ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-foreground border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body">Username</TableHead>
                      <TableHead className="font-body">Display Name</TableHead>
                      <TableHead className="font-body">Role</TableHead>
                      <TableHead className="font-body">Featured</TableHead>
                      <TableHead className="font-body">Joined</TableHead>
                      <TableHead className="font-body text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-body font-medium">
                          <button onClick={() => navigate(`/profile/${u.id}`)} className="hover:underline">
                            {u.username}
                          </button>
                        </TableCell>
                        <TableCell className="font-body">{u.display_name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "filmmaker" ? "default" : "secondary"} className="font-body text-xs">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.role === "filmmaker" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFeatured(u)}
                              title={u.featured_filmmaker ? "Remove from showcase" : "Add to showcase"}
                            >
                              <Star
                                size={16}
                                className={u.featured_filmmaker ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}
                              />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-body text-muted-foreground text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => deleteUser(u)} className="text-destructive hover:text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8 font-body">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Admin;
