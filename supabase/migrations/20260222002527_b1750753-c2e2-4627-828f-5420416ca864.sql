
-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'unread'
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public contact form)
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Admins can read all contact messages
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update contact messages (mark read/replied)
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));
