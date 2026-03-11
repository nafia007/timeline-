import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Shield, Clapperboard, Rss, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { useTheme } from "next-themes";

const DARK_LOGO_URL = "https://skiy9cizul.ufs.sh/f/kOxGBlH1ZBgl2WHIaAVeloi4jbGVfAJmERLW87CK56SUrIkq";
const LIGHT_LOGO_URL = "https://skiy9cizul.ufs.sh/f/kOxGBlH1ZBglr7u9dTp9ougVNXT8S7PfUDldLhM1R4Fwexib";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme } = useTheme();

  const logoUrl = theme === "dark" ? DARK_LOGO_URL : LIGHT_LOGO_URL;

  useEffect(() => {
    if (!user) {setIsAdmin(false);return;}
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          <img src={logoUrl} alt="TIMELINE" className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-5">
          <ThemeToggle />
          <Link
            to="/feed"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity font-body">
            <Rss size={18} />
            <span className="hidden sm:inline">Feed</span>
          </Link>
          <Link
            to="/filmmakers"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity font-body">
            <Clapperboard size={18} />
            <span className="hidden sm:inline">Filmmakers</span>
          </Link>
          <Link
            to="/subscription"
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity font-body text-primary">
            <Crown size={18} />
            <span className="hidden sm:inline">Subscribe</span>
          </Link>
          {user ?
          <>
              <NotificationBell />
              {isAdmin &&
            <Link
              to="/admin"
              className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity font-body">
                <Shield size={18} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            }
              <Link
              to={`/profile/${profile?.id}`}
              className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity font-body">
                <User size={18} />
                <span className="hidden sm:inline">{profile?.username}</span>
              </Link>
              <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="hover:opacity-70 transition-opacity">
                <LogOut size={18} />
              </button>
            </> :
          <Link to="/auth" className="btn-outline-dark text-sm font-body">
              Sign In
            </Link>
          }
        </div>
      </div>
    </nav>);
};

export default Navbar;
