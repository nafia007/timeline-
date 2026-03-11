import { Link } from "react-router-dom";
import { Film, Mail } from "lucide-react";
import { useTheme } from "next-themes";

const DARK_LOGO_URL = "https://skiy9cizul.ufs.sh/f/kOxGBlH1ZBgl2WHIaAVeloi4jbGVfAJmERLW87CK56SUrIkq";
const LIGHT_LOGO_URL = "https://skiy9cizul.ufs.sh/f/kOxGBlH1ZBglr7u9dTp9ougVNXT8S7PfUDldLhM1R4Fwexib";

const Footer = () => {
  const { theme } = useTheme();
  const logoUrl = theme === "dark" ? DARK_LOGO_URL : LIGHT_LOGO_URL;
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={logoUrl} alt="TIMELINE" className="h-6 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              A platform for emerging filmmakers to share their work and build an audience.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-sm font-body">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/filmmakers" className="text-muted-foreground hover:text-foreground transition-colors">Filmmakers</Link>
              </li>
              <li>
                <Link to="/reels" className="text-muted-foreground hover:text-foreground transition-colors">Reels</Link>
              </li>
              <li>
                <Link to="/feed" className="text-muted-foreground hover:text-foreground transition-colors">Feed</Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2 text-sm font-body">
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Create Account</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider mb-3">Contact</h4>
            <a
              href="mailto:info@holocenefilms.xyz"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
            >
              <Mail size={14} />
              info@holocenefilms.xyz
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Holocene Films. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-body tracking-widest uppercase">
            Made by Holocene Films
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
