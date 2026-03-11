
-- Posts table for social feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'text', -- 'text', 'image', 'video'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can delete any post" ON public.posts FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any post" ON public.posts FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Post likes
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_profile_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (user_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (user_profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Post comments
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can delete any comment" ON public.post_comments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;

-- Trigger for updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
