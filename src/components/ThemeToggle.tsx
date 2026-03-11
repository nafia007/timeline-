import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="hover:opacity-70 transition-opacity"
      aria-label="Toggle dark mode"
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="block dark:hidden" />
    </button>
  );
};

export default ThemeToggle;
