
-- Storage policies for product-images bucket
CREATE POLICY "Admins manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access product images"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
