
# Healthy Delights — Build Plan

A premium mobile-first e-commerce site for Menka Singh's healthy laddoos & traditional snacks brand, built in the "Festive Warm Glow" direction (warm cinematic hero, Playfair Display + Inter, brown/gold/cream palette, sticky bottom cart bar). Backed by Lovable Cloud. Payments deferred per your choice.

Because this is a very large scope, I'll deliver it in **3 phases**. After each phase you preview & approve before I continue.

---

## Phase 1 — Foundation, Catalog & Storefront (this iteration)

**Backend (Lovable Cloud)**
- Enable Lovable Cloud.
- Tables: `products`, `product_images`, `categories`, `testimonials`, `newsletter_subscribers`, `corporate_inquiries`, `contact_messages`. RLS: public SELECT on catalog tables; INSERT only on lead/contact/newsletter tables (anon allowed).
- Seed via migration: all 13 products (Laddoos + Punjab Di Panjiri + Nourishment Mix) with prices, weights, ingredients, benefits, "suitable for" tags.

**Design system**
- `src/styles.css`: tokens `--color-brand-brown #5A3921`, `--color-brand-gold #B8792E`, `--color-brand-cream #FFF7EE`, `--color-brand-beige #F7E9D7`, `--color-brand-green #4CAF50`, custom easing.
- Fonts via `@fontsource/playfair-display` (headings) + `@fontsource/inter` (body), imported in `__root.tsx`.
- Reusable shadcn-based components: `ProductCard`, `TrustBadgeStrip`, `SectionHeading`, `StickyCartBar`, `Header`, `Footer`, `MobileBottomNav`.

**Pages (routes)**
- `/` — Home with hero, trust badges, why-choose-us (6 cards), featured products (6 cards), health benefits (6 cards), testimonials carousel, newsletter, footer. Matches Festive Warm Glow layout exactly.
- `/products` — full catalog with category filter (Laddoos / Traditional Nutrition) + search.
- `/products/$slug` — product detail: gallery, description, ingredients, nutritional info, benefits, "suitable for" chips, related products, Add to Cart / Buy Now.
- `/about`, `/contact` (with form + WhatsApp CTA + map embed), `/faq`.

**Imagery**
- AI-generate one premium hero image (cinematic warm laddoo shot) + one square photo per product (~13 images) into `src/assets/`.

**E-commerce (local-first, persisted)**
- Cart + wishlist via Zustand with `localStorage` persistence — works without login.
- Sticky bottom cart bar (mobile) showing item count + total + Checkout link.
- "Buy on WhatsApp" CTA on cart for instant order while payments are off.

**Conversion/trust**
- Trust badge strip across pages, best-seller tags on products, recently viewed (localStorage), exit-intent popup with newsletter, sticky WhatsApp float button.

**SEO**
- Per-route `head()` with title/description/OG, JSON-LD `Product` schema on detail pages, `robots.txt`, dynamic `sitemap.xml` server route reflecting routes + products.

**Mobile preview** set to mobile during build.

---

## Phase 2 — Accounts, Checkout flow, Gifting & Blog

- Email/password + Google auth via Lovable Cloud; protected `/_authenticated/account`, `/orders`, `/addresses`, `/wishlist` (synced to DB).
- Checkout pages (address → review → place order). **COD only** for now; "Online payment coming soon" stub.
- `orders`, `order_items`, `addresses`, `coupons`, `reviews`, `wishlist`, `user_roles` tables with RLS + `has_role()` SECURITY DEFINER.
- Coupon codes, order tracking page, GST-style invoice PDF (printable view).
- `/corporate-gifting` page + inquiry form → DB.
- `/festive-gifting` page with occasion hampers.
- `/blog` index + `/blog/$slug` (DB-backed posts with categories & SEO meta).

## Phase 3 — Admin panel, Reviews, Polish

- Admin role gate. Admin routes for product/inventory/order/customer/coupon/blog/review/inquiry management, plus a simple analytics dashboard (orders, revenue, top products via SQL views).
- Product reviews & ratings on PDP.
- "Frequently bought together" + product recommendations.
- PWA manifest (home-screen installable; no offline SW per defaults).
- Final SEO sweep, accessibility pass, perf pass.

---

## Out of scope (will need separate decisions later)

- **Razorpay / online payments** — you chose skip; we'll wire it when you're ready (needs your keys).
- Real Google Maps embed key, real Instagram feed API (will use static placeholder grid until you connect).
- Shipping rate calculation / courier integration.

## Technical notes

- Stack stays TanStack Start + Lovable Cloud (Supabase under the hood). All DB writes go through `createServerFn` with `requireSupabaseAuth` where user-scoped; public reads use the publishable server client with narrow `TO anon` SELECT policies. Cart/wishlist start client-side (Zustand) in Phase 1, migrate to DB-synced in Phase 2 after auth lands.
- Composition strictly mirrors the chosen "Festive Warm Glow" prototype: full-bleed hero with golden gradient overlay, 2×2 trust badge grid, single-column product cards with rounded-[40px] cream cards, brown heritage section, beige testimonial card, green-tinted newsletter card, sticky brown pill cart bar.

Approve to start Phase 1.
