
-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  suitable_for TEXT[] NOT NULL DEFAULT '{}',
  nutritional_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  weight_grams INT NOT NULL DEFAULT 500,
  price_inr INT NOT NULL,
  image_key TEXT NOT NULL,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_title TEXT,
  body TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT USING (is_published = true);

-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- CONTACT MESSAGES
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- CORPORATE INQUIRIES
CREATE TABLE public.corporate_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  requirement TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.corporate_inquiries TO anon, authenticated;
GRANT ALL ON public.corporate_inquiries TO service_role;
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a corporate inquiry" ON public.corporate_inquiries FOR INSERT WITH CHECK (true);

-- SEED CATEGORIES
INSERT INTO public.categories (slug, name, description, sort_order) VALUES
  ('laddoos', 'Laddoos', 'Handcrafted nutritious laddoos made with premium ingredients', 1),
  ('traditional-nutrition', 'Traditional Nutrition', 'Authentic Dadi-Nani recipes for everyday nourishment', 2);

-- SEED PRODUCTS
WITH c AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.products
(slug, name, category_id, short_description, long_description, ingredients, benefits, suitable_for, nutritional_info, weight_grams, price_inr, image_key, is_best_seller, is_featured, sort_order)
VALUES
('punjab-di-panjiri', 'Punjab Di Panjiri', (SELECT id FROM c WHERE slug='traditional-nutrition'),
 'Authentic Punjabi panjiri with roasted wheat, gondh & dry fruits.',
 'Slow-roasted whole wheat flour blended with edible gum (gondh), pure A2 cow ghee and a generous helping of almonds, cashews and raisins. A traditional postpartum and winter nutrition powerhouse.',
 ARRAY['Whole wheat flour','A2 cow ghee','Edible gum (gondh)','Almonds','Cashews','Raisins','Cardamom','Jaggery'],
 ARRAY['Strengthens bones and joints','Boosts immunity in winter','Rich source of sustained energy','Traditional postpartum nutrition'],
 ARRAY['Working Professionals','Senior Citizens','New Mothers'],
 '{"calories":"520 kcal","protein":"11g","fat":"28g","carbs":"56g"}'::jsonb,
 500, 850, 'panjiri', true, true, 1),

('dry-fruit-laddoo', 'Dry Fruit Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Sugar-free laddoos packed with almonds, cashews, pistachios & dates.',
 'No added sugar — sweetened naturally with dates and figs. A premium dry-fruit blend bound with pure ghee. Ideal as a guilt-free indulgence or pre-workout snack.',
 ARRAY['Almonds','Cashews','Pistachios','Walnuts','Dates','Figs','A2 cow ghee','Cardamom'],
 ARRAY['Sugar-free natural sweetness','High in healthy fats and protein','Sustained pre-workout energy','Heart-healthy nuts'],
 ARRAY['Kids','Working Professionals','Fitness Enthusiasts','Senior Citizens'],
 '{"calories":"540 kcal","protein":"14g","fat":"34g","carbs":"42g"}'::jsonb,
 400, 950, 'dry-fruit', true, true, 2),

('gond-ke-laddoo', 'Gond Ke Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Winter-special edible gum laddoos with whole wheat & dry fruits.',
 'A timeless winter recipe — edible gum (gondh) puffed in pure ghee and bound with roasted wheat flour, jaggery and a medley of nuts. Believed to strengthen bones and immunity.',
 ARRAY['Edible gum (gondh)','Whole wheat flour','A2 cow ghee','Jaggery','Almonds','Pistachios','Dry coconut','Cardamom'],
 ARRAY['Strengthens bones and joints','Boosts winter immunity','Improves digestion','Warms the body'],
 ARRAY['Working Professionals','Senior Citizens','New Mothers'],
 '{"calories":"510 kcal","protein":"10g","fat":"30g","carbs":"50g"}'::jsonb,
 500, 720, 'gond', true, true, 3),

('ragi-laddoo', 'Ragi Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Iron-rich ragi (finger millet) laddoos with jaggery and ghee.',
 'Finger millet roasted to perfection, mixed with jaggery, ghee and a hint of cardamom. A naturally iron and calcium rich treat — perfect for growing kids and active adults.',
 ARRAY['Ragi (finger millet) flour','Jaggery','A2 cow ghee','Almonds','Cardamom','Dry coconut'],
 ARRAY['Rich in iron and calcium','Naturally gluten-friendly','Sustained energy release','Supports bone health'],
 ARRAY['Kids','Fitness Enthusiasts','Senior Citizens'],
 '{"calories":"440 kcal","protein":"9g","fat":"18g","carbs":"60g"}'::jsonb,
 500, 600, 'ragi', false, true, 4),

('dates-laddoo', 'Dates Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Naturally sweetened dates & nuts energy bites.',
 'Soft Medjool dates blended with roasted nuts and seeds — no sugar, no jaggery, no preservatives. Just clean, dense energy for busy mornings.',
 ARRAY['Medjool dates','Almonds','Cashews','Walnuts','Pumpkin seeds','Sunflower seeds','Cardamom'],
 ARRAY['Zero added sugar','Quick natural energy','Rich in fiber and antioxidants','Ideal pre-workout fuel'],
 ARRAY['Kids','Working Professionals','Fitness Enthusiasts'],
 '{"calories":"480 kcal","protein":"10g","fat":"22g","carbs":"58g"}'::jsonb,
 250, 550, 'dates', true, true, 5),

('millet-laddoo', 'Millet Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'A blend of five millets, jaggery, and ghee for daily nourishment.',
 'Five ancient millets — ragi, jowar, bajra, foxtail and little millet — roasted and rolled with jaggery and ghee. A gluten-friendly daily nutrition snack.',
 ARRAY['Ragi','Jowar','Bajra','Foxtail millet','Little millet','Jaggery','A2 cow ghee','Almonds'],
 ARRAY['Diabetic-friendly','Rich in fiber','Supports gut health','Sustained energy'],
 ARRAY['Working Professionals','Fitness Enthusiasts','Senior Citizens'],
 '{"calories":"450 kcal","protein":"10g","fat":"19g","carbs":"60g"}'::jsonb,
 500, 680, 'millet', false, true, 6),

('flax-seed-laddoo', 'Flax Seed Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Omega-3 rich flax seed laddoos with jaggery and nuts.',
 'Roasted flaxseeds combined with jaggery, ghee and nuts. A wholesome way to add daily omega-3 to your diet.',
 ARRAY['Flax seeds','Jaggery','A2 cow ghee','Almonds','Cardamom'],
 ARRAY['Rich in omega-3','Supports heart health','Hormone balance','Anti-inflammatory'],
 ARRAY['Working Professionals','Senior Citizens'],
 '{"calories":"470 kcal","protein":"12g","fat":"26g","carbs":"48g"}'::jsonb,
 400, 620, 'flax', false, false, 7),

('makhana-laddoo', 'Makhana Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Fox nut laddoos — light, crunchy, and protein-rich.',
 'Roasted fox nuts (makhana) bound with jaggery and ghee for a light yet protein-rich treat. A modern superfood in a traditional form.',
 ARRAY['Makhana (fox nuts)','Jaggery','A2 cow ghee','Almonds','Cardamom'],
 ARRAY['High in plant protein','Low calorie superfood','Supports kidney health','Anti-aging antioxidants'],
 ARRAY['Kids','Working Professionals','Fitness Enthusiasts'],
 '{"calories":"380 kcal","protein":"11g","fat":"14g","carbs":"56g"}'::jsonb,
 300, 640, 'makhana', false, false, 8),

('methi-laddoo', 'Methi Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Traditional fenugreek laddoos for joint and digestive wellness.',
 'A classic recipe of roasted fenugreek seeds, whole wheat flour, jaggery and pure ghee. Treasured for joint and digestive support.',
 ARRAY['Fenugreek (methi) seeds','Whole wheat flour','Jaggery','A2 cow ghee','Almonds','Edible gum'],
 ARRAY['Supports joint health','Aids digestion','Balances blood sugar','Warming for winters'],
 ARRAY['Senior Citizens','New Mothers'],
 '{"calories":"460 kcal","protein":"11g","fat":"22g","carbs":"52g"}'::jsonb,
 400, 700, 'methi', false, false, 9),

('figs-laddoo', 'Figs Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Anjeer (fig) and nut laddoos — naturally sweet, sugar-free.',
 'Soft Turkish figs blended with roasted almonds, pistachios and a touch of ghee. Naturally sweet, no added sugar.',
 ARRAY['Anjeer (figs)','Almonds','Pistachios','Cashews','A2 cow ghee','Cardamom'],
 ARRAY['Zero added sugar','Rich in fiber and iron','Supports digestion','Natural energy boost'],
 ARRAY['Kids','Working Professionals','Senior Citizens'],
 '{"calories":"460 kcal","protein":"10g","fat":"22g","carbs":"56g"}'::jsonb,
 250, 780, 'figs', false, false, 10),

('rajgira-laddoo', 'Rajgira Laddoo', (SELECT id FROM c WHERE slug='laddoos'),
 'Amaranth (rajgira) and jaggery laddoos — light and gluten-free.',
 'Popped amaranth seeds bound with jaggery — an ancient grain treat that is light, crunchy and naturally gluten-free.',
 ARRAY['Rajgira (amaranth)','Jaggery','A2 cow ghee','Cardamom'],
 ARRAY['Naturally gluten-free','Light and crunchy','Rich in calcium','Easy to digest'],
 ARRAY['Kids','Working Professionals','Senior Citizens'],
 '{"calories":"410 kcal","protein":"9g","fat":"12g","carbs":"66g"}'::jsonb,
 300, 520, 'rajgira', false, false, 11),

('sattu-laddoo', 'Sattu Laddoo (High Protein)', (SELECT id FROM c WHERE slug='laddoos'),
 'High-protein roasted chana sattu laddoos with jaggery.',
 'Roasted chana (Bengal gram) sattu blended with jaggery and ghee for a high-protein, cooling snack — a Bihari classic.',
 ARRAY['Roasted chana sattu','Jaggery','A2 cow ghee','Almonds','Cardamom'],
 ARRAY['High plant protein','Cooling for summers','Supports muscle recovery','Diabetic-friendly'],
 ARRAY['Fitness Enthusiasts','Working Professionals'],
 '{"calories":"430 kcal","protein":"18g","fat":"14g","carbs":"58g"}'::jsonb,
 400, 660, 'sattu', true, false, 12),

('nourishment-mix', 'Nourishment Mix', (SELECT id FROM c WHERE slug='traditional-nutrition'),
 'Daily nourishment powder mix of grains, nuts, and seeds.',
 'A balanced daily nutrition mix of roasted grains, nuts and seeds. Add a spoon to milk or curd for instant wholesome nourishment.',
 ARRAY['Roasted wheat','Ragi','Almonds','Cashews','Pumpkin seeds','Sunflower seeds','Jaggery powder','Cardamom'],
 ARRAY['Balanced daily nutrition','Easy to consume','Supports growth and energy','Whole food blend'],
 ARRAY['Kids','Working Professionals','Senior Citizens'],
 '{"calories":"420 kcal","protein":"12g","fat":"18g","carbs":"55g"}'::jsonb,
 500, 750, 'nourishment-mix', false, true, 13);

-- SEED TESTIMONIALS
INSERT INTO public.testimonials (author_name, author_title, body, rating, sort_order) VALUES
('Anjali Mehta', 'Mumbai', 'Authentic homemade taste with healthy ingredients. The panjiri reminds me of my grandmother''s recipe.', 5, 1),
('Rohit Sharma', 'Bengaluru', 'Perfect replacement for unhealthy sweets. I gift these to my parents every month.', 5, 2),
('Priya Iyer', 'Pune', 'My family loves the Dry Fruit Laddoos. The kids ask for them after school every day.', 5, 3),
('Vikram Singh', 'Delhi', 'Best quality and freshness — you can taste the pure ghee and the love that goes into making them.', 5, 4);
