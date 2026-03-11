import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  message: string;
  reference_id: string | null;
  read: boolean;
  created_at: string;
  actor: { username: string; avatar_url: string | null } | null;
}

const NotificationBell = () => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!data) return;

    const actorIds = [...new Set(data.map((n: any) => n.actor_id))];
    const { data: actors } = await supabase
      .from("public_profiles")
      .select("id, username, avatar_url")
      .in("id", actorIds);

    const actorMap: Record<string, any> = {};
    (actors || []).forEach((a: any) => { actorMap[a.id] = a; });

    const enriched = data.map((n: any) => ({
      ...n,
      actor: actorMap[n.actor_id] || null,
    }));

    setNotifications(enriched);
    setUnreadCount(enriched.filter((n: any) => !n.read).length);
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile]);

  // Realtime subscription
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel("notifications-" + profile.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${profile.id}` },
        () => { fetchNotifications(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const markAllRead = async () => {
    if (!profile) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getLink = (n: Notification) => {
    if (n.type === "follow") return `/profile/${n.reference_id}`;
    if (n.type === "like" || n.type === "comment") return `/feed#${n.reference_id}`;
    return "/feed";
  };

  if (!profile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative hover:opacity-70 transition-opacity"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-80 bg-card border border-border shadow-lg max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold font-body">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground font-body">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center font-body">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  to={getLink(n)}
                  onClick={() => setOpen(false)}
                  className={`block p-3 border-b border-border hover:bg-accent transition-colors ${!n.read ? "bg-accent/50" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border overflow-hidden">
                      {n.actor?.avatar_url ? (
                        <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold font-body">{n.actor?.username?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body leading-snug">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
