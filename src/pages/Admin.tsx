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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trash2, Search, Film, Users, Eye, CheckCircle, XCircle, Clock, Star, 
  ExternalLink, Lock, Unlock, Video, TrendingUp, TrendingDown, DollarSign, 
  Activity, BarChart3, PieChart, UserPlus, FilmIcon, AlertTriangle, CheckSquare,
  Square, X
} from "lucide-react";
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
  subscription_tier?: string;
  subscription_status?: string;
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

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  profiles: { username: string; display_name: string | null } | null;
  plans: { name: string; price_monthly: number } | null;
}

interface PlanStats {
  plan_id: string;
  plan_name: string;
  count: number;
}

interface AnalyticsData {
  totalUsers: number;
  totalFilms: number;
  totalViews: number;
  pendingFilms: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  topFilms: FilmRow[];
  recentSignups: ProfileRow[];
  planDistribution: PlanStats[];
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [films, setFilms] = useState<FilmRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [filmSearch, setFilmSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [editingTrailerId, setEditingTrailerId] = useState<string | null>(null);
  const [trailerInput, setTrailerInput] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedFilms, setSelectedFilms] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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
      setLoadingData(true);
      
      // Fetch users with subscription info
      const usersRes = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch films with filmmaker info
      const filmsRes = await supabase
        .from("films")
        .select("id, title, genre, view_count, created_at, filmmaker_id, status, trailer_url, requires_auth, profiles!films_filmmaker_id_fkey(username, display_name)")
        .order("created_at", { ascending: false });

      // Fetch subscriptions with user and plan info
      const subsRes = await supabase
        .from("user_subscriptions" as any)
        .select("id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, profiles!user_subscriptions_user_id_fkey(username, display_name), plans!user_subscriptions_plan_id_fkey(name, price_monthly)")
        .order("created_at", { ascending: false });

      // Fetch plan statistics
      const planStatsRes = await supabase
        .from("user_subscriptions" as any)
        .select("plan_id, status")
        .eq("status", "active");

      setUsers(usersRes.data || []);
      setFilms((filmsRes.data as any) || []);
      setSubscriptions((subsRes.data as any) || []);

      // Calculate analytics
      const allFilms = (filmsRes.data as any) || [];
      const allUsers = usersRes.data || [];
      const allSubs = (subsRes.data as any) || [];
      const activeSubs = allSubs.filter((s: any) => s.status === "active");
      
      // Calculate plan distribution
      const planCounts: Record<string, number> = {};
      activeSubs.forEach((s: any) => {
        planCounts[s.plan_id] = (planCounts[s.plan_id] || 0) + 1;
      });

      // Get plan names
      const planNames: Record<string, string> = {
        'basic': 'Basic',
        'standard': 'Standard', 
        'premium': 'Premium'
      };

      const planDistribution: PlanStats[] = Object.entries(planCounts).map(([plan_id, count]) => ({
        plan_id,
        plan_name: planNames[plan_id] || plan_id,
        count
      }));

      // Top films by views
      const topFilms = [...allFilms].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

      // Recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentSignups = allUsers.filter((u: any) => new Date(u.created_at) > weekAgo);

      // Calculate revenue (simplified - using monthly prices)
      const planPrices: Record<string, number> = {
        'basic': 49,
        'standard': 99,
        'premium': 149
      };
      
      const totalRevenue = activeSubs.reduce((sum: number, s: any) => {
        return sum + (planPrices[s.plan_id] || 0);
      }, 0);

      setAnalytics({
        totalUsers: allUsers.length,
        totalFilms: allFilms.length,
        totalViews: allFilms.reduce((sum, f) => sum + (f.view_count || 0), 0),
        pendingFilms: allFilms.filter(f => f.status === "pending").length,
        activeSubscriptions: activeSubs.length,
        totalRevenue,
        monthlyRevenue: totalRevenue,
        topFilms,
        recentSignups,
        planDistribution
      });

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

  const toggleFilmSelection = (filmId: string) => {
    setSelectedFilms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filmId)) {
        newSet.delete(filmId);
      } else {
        newSet.add(filmId);
      }
      return newSet;
    });
  };

  const selectAllFilms = (filmList: FilmRow[]) => {
    if (selectedFilms.size === filmList.length) {
      setSelectedFilms(new Set());
    } else {
      setSelectedFilms(new Set(filmList.map(f => f.id)));
    }
  };

  const bulkApprove = async () => {
    if (selectedFilms.size === 0) return;
    setBulkActionLoading(true);
    const { error } = await supabase
      .from("films")
      .update({ status: "approved" })
      .in("id", Array.from(selectedFilms));
    
    if (error) {
      toast.error("Failed to approve films");
    } else {
      setFilms(prev => prev.map(f => 
        selectedFilms.has(f.id) ? { ...f, status: "approved" } : f
      ));
      toast.success(`${selectedFilms.size} films approved`);
    }
    setSelectedFilms(new Set());
    setBulkActionLoading(false);
  };

  const bulkDelete = async () => {
    if (selectedFilms.size === 0) return;
    if (!confirm(`Delete ${selectedFilms.size} films? This cannot be undone.`)) return;
    setBulkActionLoading(true);
    
    const { error } = await supabase
      .from("films")
      .delete()
      .in("id", Array.from(selectedFilms));
    
    if (error) {
      toast.error("Failed to delete films");
    } else {
      setFilms(prev => prev.filter(f => !selectedFilms.has(f.id)));
      toast.success(`${selectedFilms.size} films deleted`);
    }
    setSelectedFilms(new Set());
    setBulkActionLoading(false);
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

  const subscriptionStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="font-body text-xs bg-green-600 text-white">Active</Badge>;
      case "trialing":
        return <Badge className="font-body text-xs bg-blue-600 text-white">Trialing</Badge>;
      case "canceled":
        return <Badge variant="destructive" className="font-body text-xs">Canceled</Badge>;
      case "past_due":
        return <Badge className="font-body text-xs bg-orange-500 text-white">Past Due</Badge>;
      default:
        return <Badge variant="secondary" className="font-body text-xs">{status}</Badge>;
    }
  };


  const FilmTableRows = ({ filmList, showCheckbox = false }: { filmList: FilmRow[], showCheckbox?: boolean }) => (
    <>
      {filmList.map((f) => (
        <TableRow key={f.id}>
          {showCheckbox && (
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFilmSelection(f.id)}
              >
                {selectedFilms.has(f.id) ? (
                  <CheckSquare size={16} className="text-primary" />
                ) : (
                  <Square size={16} className="text-muted-foreground" />
                )}
              </Button>
            </TableCell>
          )}
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
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingTrailerId(null)}><X size={14} /></Button>
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
        <p className="text-muted-foreground font-body mb-8">Manage platform users, films, and subscriptions</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Total Users</p>
                  <p className="text-2xl font-display font-bold">{analytics?.totalUsers || 0}</p>
                </div>
                <Users size={24} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Total Films</p>
                  <p className="text-2xl font-display font-bold">{analytics?.totalFilms || 0}</p>
                </div>
                <FilmIcon size={24} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Total Views</p>
                  <p className="text-2xl font-display font-bold">{analytics?.totalViews.toLocaleString() || 0}</p>
                </div>
                <Eye size={24} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-display font-bold">{analytics?.pendingFilms || 0}</p>
                </div>
                <Clock size={24} className="text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Active Subs</p>
                  <p className="text-2xl font-display font-bold">{analytics?.activeSubscriptions || 0}</p>
                </div>
                <DollarSign size={24} className="text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Card */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <TrendingUp size={20} className="text-green-600" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Monthly Revenue (ZAR)</p>
                <p className="text-3xl font-display font-bold text-green-600">
                  R{analytics?.monthlyRevenue.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Projected Annual (ZAR)</p>
                <p className="text-3xl font-display font-bold">
                  R{(analytics?.monthlyRevenue ? analytics.monthlyRevenue * 12 : 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6 flex flex-wrap h-auto">
            <TabsTrigger value="pending" className="font-body">
              Pending {pendingFilms.length > 0 && `(${pendingFilms.length})`}
            </TabsTrigger>
            <TabsTrigger value="films" className="font-body">All Films</TabsTrigger>
            <TabsTrigger value="users" className="font-body">Users</TabsTrigger>
            <TabsTrigger value="subscriptions" className="font-body">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics" className="font-body">Analytics</TabsTrigger>
          </TabsList>

          {/* Pending Films Tab */}
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
                      <TableHead className="w-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => selectAllFilms(pendingFilms)}
                        >
                          {selectedFilms.size === pendingFilms.length && pendingFilms.length > 0 ? (
                            <CheckSquare size={16} className="text-primary" />
                          ) : (
                            <Square size={16} className="text-muted-foreground" />
                          )}
                        </Button>
                      </TableHead>
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
                    <FilmTableRows filmList={pendingFilms} showCheckbox />
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* All Films Tab */}
          <TabsContent value="films">
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="relative max-w-sm flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search films..."
                  value={filmSearch}
                  onChange={(e) => setFilmSearch(e.target.value)}
                  className="pl-9 font-body"
                />
              </div>
              {selectedFilms.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-body">{selectedFilms.size} selected</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={bulkApprove}
                    disabled={bulkActionLoading}
                    className="font-body"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Approve All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={bulkDelete}
                    disabled={bulkActionLoading}
                    className="text-destructive font-body"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              )}
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
                      <TableHead className="w-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => selectAllFilms(filteredFilms)}
                        >
                          {selectedFilms.size === filteredFilms.length && filteredFilms.length > 0 ? (
                            <CheckSquare size={16} className="text-primary" />
                          ) : (
                            <Square size={16} className="text-muted-foreground" />
                          )}
                        </Button>
                      </TableHead>
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
                    <FilmTableRows filmList={filteredFilms} showCheckbox />
                    {filteredFilms.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8 font-body">
                          No films found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
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
                      <TableHead className="font-body">Subscription</TableHead>
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
                          <Badge variant="outline" className="font-body text-xs">
                            {u.subscription_tier || "free"}
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
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8 font-body">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            {loadingData ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-foreground border-t-transparent animate-spin" />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center text-muted-foreground py-16 font-body">
                No subscriptions yet
              </div>
            ) : (
              <div className="border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-body">User</TableHead>
                      <TableHead className="font-body">Plan</TableHead>
                      <TableHead className="font-body">Status</TableHead>
                      <TableHead className="font-body">Period Start</TableHead>
                      <TableHead className="font-body">Period End</TableHead>
                      <TableHead className="font-body">Cancel at Period End</TableHead>
                      <TableHead className="font-body">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-body font-medium">
                          {s.profiles?.display_name || s.profiles?.username || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-body text-xs">
                            {(s.plans as any)?.name || s.plan_id}
                          </Badge>
                        </TableCell>
                        <TableCell>{subscriptionStatusBadge(s.status)}</TableCell>
                        <TableCell className="font-body text-muted-foreground text-sm">
                          {s.current_period_start ? new Date(s.current_period_start).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="font-body text-muted-foreground text-sm">
                          {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          {s.cancel_at_period_end ? (
                            <Badge variant="secondary" className="font-body text-xs">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="font-body text-xs">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-body text-muted-foreground text-sm">
                          {new Date(s.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Films Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <TrendingUp size={20} />
                    Top Performing Films
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.topFilms.length === 0 ? (
                    <p className="text-muted-foreground font-body">No films yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analytics?.topFilms.map((film, index) => (
                        <div key={film.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-display font-bold text-muted-foreground w-6">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-body font-medium">{film.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {film.profiles?.display_name || film.profiles?.username || "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-body font-bold">{film.view_count.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">views</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plan Distribution Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <PieChart size={20} />
                    Subscription Plan Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.planDistribution.length === 0 ? (
                    <p className="text-muted-foreground font-body">No active subscriptions</p>
                  ) : (
                    <div className="space-y-4">
                      {analytics?.planDistribution.map((plan) => (
                        <div key={plan.plan_id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{plan.plan_name}</Badge>
                            <span className="font-body text-muted-foreground">
                              {plan.count} {plan.count === 1 ? "subscriber" : "subscribers"}
                            </span>
                          </div>
                          <div className="w-24 bg-muted h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full"
                              style={{ 
                                width: `${(plan.count / (analytics?.activeSubscriptions || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-body font-medium">Free Users</span>
                          <span className="font-body font-bold">
                            {analytics?.totalUsers ? analytics.totalUsers - (analytics?.activeSubscriptions || 0) : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Signups Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <UserPlus size={20} />
                    Recent Signups (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.recentSignups.length === 0 ? (
                    <p className="text-muted-foreground font-body">No recent signups</p>
                  ) : (
                    <div className="space-y-2">
                      {analytics?.recentSignups.slice(0, 10).map((u) => (
                        <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-body font-medium">{u.username}</p>
                            <p className="text-xs text-muted-foreground">{u.display_name || "No display name"}</p>
                          </div>
                          <span className="text-xs text-muted-foreground font-body">
                            {new Date(u.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Genre Distribution Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart3 size={20} />
                    Films by Genre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {films.length === 0 ? (
                    <p className="text-muted-foreground font-body">No films yet</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(
                        films.reduce((acc, f) => {
                          const genre = f.genre || "Uncategorized";
                          acc[genre] = (acc[genre] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([genre, count]) => (
                          <div key={genre} className="flex items-center justify-between">
                            <span className="font-body">{genre}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-muted h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-primary h-full rounded-full"
                                  style={{ width: `${(count / films.length) * 100}%` }}
                                />
                              </div>
                              <span className="font-body text-sm w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Admin;
