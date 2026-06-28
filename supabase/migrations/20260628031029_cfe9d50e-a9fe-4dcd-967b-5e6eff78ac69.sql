
-- Helper: admin OR super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin')) $$;
GRANT EXECUTE ON FUNCTION public.is_admin_or_super(uuid) TO authenticated;

-- COUPONS: drop broad read; admins only.
DROP POLICY IF EXISTS "Authenticated can read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins read coupons" ON public.coupons;
CREATE POLICY "Admins read coupons" ON public.coupons FOR SELECT TO authenticated USING (public.is_admin_or_super(auth.uid()));
DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

-- PRODUCTS: PDP fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gallery_image_keys text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ingredients text,
  ADD COLUMN IF NOT EXISTS nutrition_facts jsonb,
  ADD COLUMN IF NOT EXISTS storage_instructions text,
  ADD COLUMN IF NOT EXISTS shelf_life text,
  ADD COLUMN IF NOT EXISTS delivery_eta text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS related_slugs text[] NOT NULL DEFAULT '{}';

-- ORDERS: add guest email column
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text;

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT SELECT ON public.product_reviews TO anon;
GRANT ALL ON public.product_reviews TO service_role;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads approved reviews" ON public.product_reviews FOR SELECT TO anon, authenticated USING (status='approved');
CREATE POLICY "Users read own reviews" ON public.product_reviews FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "Users insert own reviews" ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own reviews" ON public.product_reviews FOR UPDATE TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id AND status='pending');
CREATE POLICY "Admins manage all reviews" ON public.product_reviews FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grandfather existing admins as super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'super_admin'::public.app_role FROM public.user_roles WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- GUEST CHECKOUT
DROP POLICY IF EXISTS "Guest checkout insert" ON public.orders;
CREATE POLICY "Guest checkout insert" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL AND customer_email IS NOT NULL)
  );
