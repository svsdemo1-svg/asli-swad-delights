
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  mobile text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ADDRESSES ============
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view addresses" ON public.addresses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE DEFAULT ('HD-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*100000))::text,5,'0')),
  status text NOT NULL DEFAULT 'pending',
  subtotal_inr numeric(10,2) NOT NULL,
  discount_inr numeric(10,2) NOT NULL DEFAULT 0,
  shipping_inr numeric(10,2) NOT NULL DEFAULT 0,
  total_inr numeric(10,2) NOT NULL,
  coupon_code text,
  payment_method text NOT NULL DEFAULT 'cod',
  notes text,
  ship_full_name text NOT NULL,
  ship_mobile text NOT NULL,
  ship_line1 text NOT NULL,
  ship_line2 text,
  ship_city text NOT NULL,
  ship_state text NOT NULL,
  ship_pincode text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  product_slug text NOT NULL,
  image_key text NOT NULL,
  weight_grams integer NOT NULL DEFAULT 0,
  unit_price_inr numeric(10,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_inr numeric(10,2) NOT NULL,
  kind text NOT NULL DEFAULT 'product'
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Users insert own order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Admins manage order items" ON public.order_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ COUPONS ============
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','flat')),
  value numeric(10,2) NOT NULL,
  min_order_inr numeric(10,2) NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.coupons TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ WISHLIST ============
CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.wishlist
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ PRODUCTS: allow admin writes ============
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ GIFT HAMPERS ============
CREATE TABLE public.gift_hampers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  occasion text NOT NULL DEFAULT 'festive',
  price_inr numeric(10,2) NOT NULL,
  image_key text NOT NULL,
  contents jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gift_hampers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_hampers TO authenticated;
GRANT ALL ON public.gift_hampers TO service_role;
ALTER TABLE public.gift_hampers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published hampers" ON public.gift_hampers
  FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage hampers" ON public.gift_hampers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ BLOG ============
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  body_markdown text NOT NULL,
  cover_image_key text NOT NULL,
  author text NOT NULL DEFAULT 'Menka Singh',
  seo_title text,
  seo_description text,
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage posts" ON public.blog_posts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blog_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED ============
INSERT INTO public.coupons (code, discount_type, value, min_order_inr) VALUES
  ('WELCOME10','percent',10,499),
  ('FESTIVE150','flat',150,999);

INSERT INTO public.gift_hampers (slug,name,description,occasion,price_inr,image_key,contents,sort_order) VALUES
  ('diwali-deluxe-hamper','Diwali Deluxe Hamper','A handpicked festive box of premium laddoos, dry fruit treats and traditional sweets to share with loved ones.','diwali',1499,'product-dry-fruit','["Dry Fruit Laddoo 250g","Gond Laddoo 200g","Dates Laddoo 200g","Handcrafted gift card"]'::jsonb,1),
  ('wedding-blessings-hamper','Wedding Blessings Hamper','An elegant wooden-style box of nourishing traditional sweets, perfect for wedding gifting.','wedding',1899,'product-gond','["Gond Laddoo 250g","Methi Laddoo 250g","Punjab Di Panjiri 300g","Premium ribbon-tied packaging"]'::jsonb,2),
  ('wellness-mom-to-be-hamper','Wellness Mom-to-Be Hamper','Specially curated post-natal nutrition box with gond, methi and panjiri.','wellness',1299,'product-methi','["Gond Laddoo 250g","Methi Laddoo 250g","Punjab Di Panjiri 250g","Wellness booklet"]'::jsonb,3),
  ('corporate-festive-hamper','Corporate Festive Hamper','Branded gifting hamper for corporate clients and employees. Bulk customisation available.','corporate',2499,'product-nourishment-mix','["Assorted Laddoos 500g","Nourishment Mix 300g","Custom branded card","Premium box"]'::jsonb,4);

INSERT INTO public.blog_posts (slug,title,excerpt,body_markdown,cover_image_key,seo_title,seo_description) VALUES
  ('why-gond-laddoo-is-a-winter-superfood','Why Gond Laddoo is a Winter Superfood','Discover the time-tested wisdom behind gond laddoos and why your dadi was right all along.','## The wisdom of generations\n\nGond (edible gum) laddoos have been a winter staple in Indian homes for centuries. Rich in calcium, healthy fats and slow-burning energy, they keep joints supple and immunity strong.\n\n### Key benefits\n\n- Strengthens bones and joints\n- Boosts immunity in cold months\n- Provides sustained energy\n- Aids post-natal recovery\n\nMade fresh in small batches with desi ghee, almonds, and edible gum — no preservatives, just *asli dadi nani ka swad*.','product-gond','Gond Laddoo: A Winter Superfood | Healthy Delights','Learn why gond laddoo has been India''s winter wellness secret for generations.'),
  ('postnatal-nutrition-the-panjiri-way','Postnatal Nutrition the Panjiri Way','How Punjab Di Panjiri supports new mothers with traditional nourishment.','## A tradition that nourishes\n\nPanjiri is a Punjabi post-natal staple loaded with ghee, whole-wheat flour, gond, dry fruits and warming herbs.\n\n### Why mothers swear by it\n\n- Supports lactation\n- Rebuilds strength\n- Easy to digest\n- Warming for the body\n\nOur Punjab Di Panjiri is made the way Menka''s grandmother made it — slow-roasted, ghee-laden, never compromised.','product-panjiri','Postnatal Panjiri Nutrition | Healthy Delights','Discover the traditional benefits of Panjiri for new mothers.'),
  ('5-healthy-snacks-for-kids-tiffin','5 Healthy Snacks for Kids'' Tiffin','Wholesome, preservative-free snacks that kids actually love.','## Real food for growing kids\n\nPacking a healthy tiffin every day is tough. Here are five Healthy Delights picks that combine nutrition with the *swad* kids crave.\n\n1. **Dry Fruit Laddoo** — energy & calcium\n2. **Dates Laddoo** — natural sweetness\n3. **Makhana Laddoo** — light and crunchy\n4. **Ragi Laddoo** — iron-rich\n5. **Millet Laddoo** — fiber-packed\n\nAll made with desi ghee, jaggery and zero refined sugar.','product-dates','Healthy Tiffin Snacks for Kids | Healthy Delights','5 preservative-free traditional snacks perfect for school tiffins.');
