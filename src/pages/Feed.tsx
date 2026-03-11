import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Send, Image, Film, Type, Loader2, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoriesBar from "@/components/StoriesBar";
import { Link } from "react-router-dom";

interface PostAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Post {
  id: string;
  author_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string;
  created_at: string;
  author: PostAuthor;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: PostAuthor;
}

const Feed = () => {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaType, setNewMediaType] = useState<"text" | "image" | "video">("text");
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    const { data: postsData, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) { console.error(error); setLoading(false); return; }

    const authorIds = [...new Set((postsData || []).map(p => p.author_id))];
    const { data: authors } = await supabase
      .from("public_profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", authorIds);

    const authorMap: Record<string, PostAuthor> = {};
    (authors || []).forEach(a => { authorMap[a.id] = a; });

    const postIds = (postsData || []).map(p => p.id);
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id, user_profile_id")
      .in("post_id", postIds);

    const { data: commentCounts } = await supabase
      .from("post_comments")
      .select("post_id")
      .in("post_id", postIds);

    const likesMap: Record<string, { count: number; likedByMe: boolean }> = {};
    (likes || []).forEach(l => {
      if (!likesMap[l.post_id]) likesMap[l.post_id] = { count: 0, likedByMe: false };
      likesMap[l.post_id].count++;
      if (profile && l.user_profile_id === profile.id) likesMap[l.post_id].likedByMe = true;
    });

    const commentsMap: Record<string, number> = {};
    (commentCounts || []).forEach(c => {
      commentsMap[c.post_id] = (commentsMap[c.post_id] || 0) + 1;
    });

    const enrichedPosts: Post[] = (postsData || []).map(p => ({
      ...p,
      media_type: p.media_type || "text",
      author: authorMap[p.author_id] || { id: p.author_id, username: "unknown", display_name: null, avatar_url: null },
      likes_count: likesMap[p.id]?.count || 0,
      comments_count: commentsMap[p.id] || 0,
      liked_by_me: likesMap[p.id]?.likedByMe || false,
    }));

    setPosts(enrichedPosts);
    setLoading(false);
  }, [profile]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Realtime: listen for new posts
  useEffect(() => {
    const channel = supabase
      .channel("feed-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  const createNotification = async (recipientId: string, type: string, referenceId: string, message: string) => {
    if (!profile || recipientId === profile.id) return;
    await supabase.from("notifications").insert({
      recipient_id: recipientId,
      actor_id: profile.id,
      type,
      reference_id: referenceId,
      message,
    });
  };

  const handleCreatePost = async () => {
    if (!profile) { toast.error("Sign in to post"); return; }
    if (!newContent && !newMediaUrl) { toast.error("Add some content"); return; }

    setSubmitting(true);
    const { error } = await supabase.from("posts").insert({
      author_id: profile.id,
      content: newContent || null,
      media_url: newMediaUrl || null,
      media_type: newMediaType,
    });

    if (error) { toast.error("Failed to create post"); console.error(error); }
    else {
      toast.success("Post created!");
      setNewContent(""); setNewMediaUrl(""); setNewMediaType("text"); setShowCompose(false);
      fetchPosts();
    }
    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    if (!profile) { toast.error("Sign in to like posts"); return; }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.liked_by_me) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_profile_id", profile.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_profile_id: profile.id });
      // Send notification
      const actorName = profile.display_name || profile.username;
      createNotification(post.author_id, "like", postId, `${actorName} liked your post`);
    }

    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/feed#${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.content?.slice(0, 50) || "Check this out", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch { /* user cancelled share */ }
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) return;

    const authorIds = [...new Set((data || []).map(c => c.author_id))];
    const { data: authors } = await supabase
      .from("public_profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", authorIds);

    const authorMap: Record<string, PostAuthor> = {};
    (authors || []).forEach(a => { authorMap[a.id] = a; });

    const enriched: Comment[] = (data || []).map(c => ({
      ...c,
      author: authorMap[c.author_id] || { id: c.author_id, username: "unknown", display_name: null, avatar_url: null },
    }));

    setComments(prev => ({ ...prev, [postId]: enriched }));
  };

  const toggleComments = (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(postId);
      fetchComments(postId);
    }
  };

  const handleComment = async (postId: string) => {
    if (!profile) { toast.error("Sign in to comment"); return; }
    if (!commentText.trim()) return;

    setCommentLoading(true);
    const { error } = await supabase.from("post_comments").insert({
      post_id: postId,
      author_id: profile.id,
      content: commentText.trim(),
    });

    if (error) { toast.error("Failed to post comment"); }
    else {
      // Send notification
      const post = posts.find(p => p.id === postId);
      if (post) {
        const actorName = profile.display_name || profile.username;
        createNotification(post.author_id, "comment", postId, `${actorName} commented on your post`);
      }
      setCommentText("");
      fetchComments(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
    }
    setCommentLoading(false);
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) toast.error("Failed to delete");
    else { setPosts(prev => prev.filter(p => p.id !== postId)); toast.success("Post deleted"); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Stories Bar */}
        <StoriesBar />

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Feed</h1>
          {profile && (
            <button
              onClick={() => setShowCompose(!showCompose)}
              className="btn-outline-dark text-sm font-body"
            >
              {showCompose ? "Cancel" : "New Post"}
            </button>
          )}
        </div>

        {/* Compose */}
        <AnimatePresence>
          {showCompose && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-border bg-card p-5 mb-8 space-y-4 overflow-hidden"
            >
              <div className="flex items-start gap-3">
                {profile && (
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold font-body">{profile.username[0]?.toUpperCase()}</span>
                    )}
                  </div>
                )}
                <textarea
                  placeholder="What's on your mind?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={3}
                  className="flex-1 input-minimal font-body resize-none text-sm"
                  autoFocus
                />
              </div>

              {/* Media type selector */}
              <div className="flex gap-2 flex-wrap">
                {([
                  { key: "text" as const, icon: Type, label: "Text" },
                  { key: "image" as const, icon: Image, label: "Image" },
                  { key: "video" as const, icon: Film, label: "Video" },
                ]).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setNewMediaType(key); if (key === "text") setNewMediaUrl(""); }}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-all font-body ${
                      newMediaType === key
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              {newMediaType !== "text" && (
                <input
                  type="url"
                  placeholder={`${newMediaType === "image" ? "Image" : "Video"} URL`}
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="input-minimal font-body text-sm"
                />
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleCreatePost}
                  disabled={submitting}
                  className="btn-outline-dark text-sm font-body flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground font-body py-20">No posts yet. Be the first to share!</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                id={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border bg-card"
              >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 pb-2">
                  <Link to={`/profile/${post.author.id}`}>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/30">
                      {post.author.avatar_url ? (
                        <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold font-body">{post.author.username[0]?.toUpperCase()}</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${post.author.id}`} className="text-sm font-semibold hover:underline font-body">
                      {post.author.display_name || post.author.username}
                    </Link>
                    <p className="text-xs text-muted-foreground font-body">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {profile && post.author_id === profile.id && (
                    <button onClick={() => handleDeletePost(post.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Content */}
                {post.content && (
                  <p className="px-4 py-2 text-sm font-body whitespace-pre-wrap leading-relaxed">{post.content}</p>
                )}

                {/* Media */}
                {post.media_url && post.media_type === "image" && (
                  <div className="px-4 pb-2">
                    <img src={post.media_url} alt="" className="w-full max-h-[500px] object-cover rounded-sm" />
                  </div>
                )}
                {post.media_url && post.media_type === "video" && (
                  <div className="px-4 pb-2">
                    <video src={post.media_url} controls className="w-full max-h-[500px] rounded-sm" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 px-4 py-3 border-t border-border">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm font-body transition-all ${
                      post.liked_by_me ? "text-destructive scale-110" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart size={18} fill={post.liked_by_me ? "currentColor" : "none"} />
                    {post.likes_count > 0 && <span>{post.likes_count}</span>}
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                  >
                    <MessageCircle size={18} />
                    {post.comments_count > 0 && <span>{post.comments_count}</span>}
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-body ml-auto"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                {/* Comments */}
                <AnimatePresence>
                  {expandedComments === post.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border overflow-hidden"
                    >
                      <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                        {(comments[post.id] || []).length === 0 ? (
                          <p className="text-xs text-muted-foreground font-body">No comments yet</p>
                        ) : (
                          (comments[post.id] || []).map(c => (
                            <div key={c.id} className="flex gap-2">
                              <Link to={`/profile/${c.author.id}`}>
                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border overflow-hidden">
                                  {c.author.avatar_url ? (
                                    <img src={c.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] font-bold font-body">{c.author.username[0]?.toUpperCase()}</span>
                                  )}
                                </div>
                              </Link>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                  <Link to={`/profile/${c.author.id}`} className="text-xs font-semibold font-body hover:underline">
                                    {c.author.display_name || c.author.username}
                                  </Link>
                                  <span className="text-[10px] text-muted-foreground font-body">
                                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-xs text-foreground/80 font-body mt-0.5">{c.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {profile && (
                        <div className="flex gap-2 p-4 pt-0">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleComment(post.id); }}
                            className="flex-1 text-xs border-b border-border bg-transparent py-1 focus:outline-none focus:border-foreground font-body"
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={commentLoading || !commentText.trim()}
                            className="text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Feed;
