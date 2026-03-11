import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface StoryAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

const StoriesBar = () => {
  const { profile } = useAuth();
  const [recentAuthors, setRecentAuthors] = useState<StoryAuthor[]>([]);

  useEffect(() => {
    const fetchRecentPosters = async () => {
      // Get most recent unique posters (simulates "stories")
      const { data } = await supabase
        .from("posts")
        .select("author_id, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!data) return;

      const uniqueIds: string[] = [];
      data.forEach((p: any) => {
        if (!uniqueIds.includes(p.author_id) && uniqueIds.length < 12) {
          uniqueIds.push(p.author_id);
        }
      });

      if (uniqueIds.length === 0) return;

      const { data: authors } = await supabase
        .from("public_profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", uniqueIds);

      if (authors) {
        // Preserve order
        const authorMap: Record<string, StoryAuthor> = {};
        authors.forEach((a: any) => { authorMap[a.id] = a; });
        setRecentAuthors(uniqueIds.map(id => authorMap[id]).filter(Boolean));
      }
    };

    fetchRecentPosters();
  }, []);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      {/* Your story placeholder */}
      {profile && (
        <Link to={`/profile/${profile.id}`} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center hover:border-foreground transition-colors">
            <Plus size={20} className="text-muted-foreground" />
          </div>
          <span className="text-[10px] font-body text-muted-foreground w-16 text-center truncate">Your story</span>
        </Link>
      )}

      {recentAuthors.map((author) => (
        <Link
          key={author.id}
          to={`/profile/${author.id}`}
          className="flex flex-col items-center gap-1 flex-shrink-0"
        >
          <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5">
            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {author.avatar_url ? (
                <img src={author.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-sm font-bold font-body">{author.username[0]?.toUpperCase()}</span>
              )}
            </div>
          </div>
          <span className="text-[10px] font-body text-muted-foreground w-16 text-center truncate">
            {author.display_name || author.username}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default StoriesBar;
