
-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'comment', 'follow'
  reference_id TEXT, -- post_id, film_id, etc.
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (actor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add tags column to films for AI metadata
ALTER TABLE public.films ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
