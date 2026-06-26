## Phase 2 — Accounts, Checkout, Gifting, Blog & Admin Editor

This iteration adds authentication, order management, DB-synced wishlist, gifting hamper catalogue, a blog CMS, and an admin panel where Menka can edit product images, prices, and weights.

---

### 1. Authentication (Lovable Cloud)

- Email/password + Google sign-in (Lovable-managed).
- New public route `/auth` (sign in / sign up tabs) with form validation.
- Integration-managed `_authenticated/` layout protects `/account`, `/orders`, `/orders/$id`, `/addresses`, `/wishlist`, `/admin/*`.
- Header gets an account icon (sign in when logged out, account menu when logged in).

### 2. Database (single migration)

New tables (all with RLS + grants):
- `profiles` (id → auth.users, full_name, mobile, created_at)
- `app_role` enum (`admin`, `customer`) + `user_roles` + `has_role()` SECURITY DEFINER
- `addresses` (user-scoped)
- `orders` (user_id, status, subtotal, discount, total, coupon_code, address snapshot, payment_method='cod', notes)
- `order_items` (order_id, product snapshot: name, slug, price, weight, qty, image_key)
- `coupons` (code, discount_type, value, min_order, expires_at, active)
- `wishlist` (user_id, product_id, unique)
- `gift_hampers` (slug, name, description, price, image_key, contents jsonb, occasion, is_published)
- `blog_posts` (slug, title, excerpt, body markdown, cover_image_key, author, published_at, is_published, seo_title, seo_description)
- Trigger to auto-create `profiles` + default `customer` role on signup.
- Seed: 4 gift hampers (Diwali, Wedding, Wellness, Corporate), 3 starter blog posts, 1 sample coupon `WELCOME10`.

### 3. Checkout flow (COD only)

- `/cart` → "Proceed to Checkout" (requires login; redirects to `/auth?redirect=/checkout`).
- `/checkout`: address selector/new-address form → coupon code → review → place order (server fn writes `orders` + `order_items`, clears cart, redirects to `/orders/$id`).
- `/orders` list, `/orders/$id` detail with printable invoice view.
- Online payment shown as "Coming soon" disabled option.

### 4. Wishlist sync

- Existing local Zustand wishlist becomes the source while logged out.
- On login, server fn merges local wishlist → `wishlist` table, then component reads from DB via TanStack Query.
- `/wishlist` page lists saved products with "Move to cart".

### 5. Gifting

- `/festive-gifting` and `/corporate-gifting` rewritten to read from `gift_hampers` (filtered by occasion). Hamper cards add to cart as a single line item.

### 6. Blog CMS

- `/blog` index (DB-backed, paginated 9/page).
- `/blog/$slug` post detail with markdown render (`react-markdown` + `remark-gfm`), JSON-LD `Article` schema, per-post SEO meta.

### 7. Admin panel (role-gated)

Routes under `/_authenticated/admin/` — gated by `has_role(uid, 'admin')` via a child `beforeLoad` check calling a server fn. Non-admins redirect to `/`.

- `/admin` dashboard: counts (orders, revenue today/30d, subscribers, contact messages).
- `/admin/products` — table with inline edit for **price, weight, image** plus toggle in_stock / featured / best_seller. Image editor accepts upload to Supabase Storage bucket `product-images` (public read) OR URL paste; falls back to bundled asset key when blank.
- `/admin/products/$id` — full editor (name, slug, description, ingredients, benefits, suitable_for, nutritional_info JSON, category).
- `/admin/orders` — list + status update (pending → confirmed → shipped → delivered → cancelled).
- `/admin/hampers`, `/admin/blog`, `/admin/coupons` — CRUD lists with the same image upload helper.
- `/admin/inquiries` — read-only list of contact + corporate messages + newsletter subs (with CSV export).

### 8. Storage

- Create public bucket `product-images` with RLS allowing admin-only writes, public reads. `product_card` resolves `image_key` to either bundled asset (existing keys) or storage public URL (when key starts with `storage:`).

### 9. Server functions

New `*.functions.ts` files: `auth.functions.ts` (profile, role check), `orders.functions.ts`, `wishlist.functions.ts`, `coupons.functions.ts`, `hampers.functions.ts`, `blog.functions.ts`, `admin.functions.ts` (all `requireSupabaseAuth` + role check where needed).

### 10. UI polish

- Header account dropdown, mobile drawer adds Account/Orders/Wishlist.
- Toast confirmations for order placement, wishlist add, admin saves.

### Technical notes

- Stack unchanged: TanStack Start + Lovable Cloud. Supabase Auth via `lovable.auth.signInWithOAuth("google", ...)` plus email/password through `supabase.auth.signInWithPassword`. `requireSupabaseAuth` middleware on all user-scoped server fns; `has_role` rpc gates admin fns. Admin fns that touch storage policies use `supabaseAdmin` loaded inside the handler. Cart store gains `clearCart()` post-checkout. Existing public catalog reads stay on the publishable server client.

---

### Out of scope (still)

- Online payments (Razorpay) — explicitly deferred.
- Shipping rate calculation, courier integration, real-time order tracking.
- Product reviews & "frequently bought together" → Phase 3.

Approve to start building.