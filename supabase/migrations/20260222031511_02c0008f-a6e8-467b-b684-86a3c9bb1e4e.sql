
-- Create public-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('public-images', 'public-images', true);

-- Anyone can read public-images
CREATE POLICY "Anyone can view public images"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-images');

-- Admins can upload to public-images
CREATE POLICY "Admins can upload public images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'public-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update public-images
CREATE POLICY "Admins can update public images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'public-images' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete from public-images
CREATE POLICY "Admins can delete public images"
ON storage.objects FOR DELETE
USING (bucket_id = 'public-images' AND public.has_role(auth.uid(), 'admin'));

-- Enable realtime on shipments and shipment_status_log
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_status_log;
