## Production Readiness Upgrade — Plan

This is a large multi-area scope. I'll execute it in phases below, but I need a few quick decisions first so I don't build the wrong thing.

---

### Decisions I need from you

1. **Super Admin credentials** — what email + password should I provision for the first Super Admin? (You can also tell me to generate a strong password and show it once.) Also: do you want sign-ups disabled for everyone except admin-invited users, or open sign-up for customers?
2. **Transactional emails** — order confirmation emails need a sender domain. Should I scaffold Lovable Emails (requires you to add a domain + DNS records during setup), or skip emails for now and ship the rest?
3. **Analytics IDs** — do you have a GA4 Measurement ID (G-XXXX), Meta Pixel ID, and Google Search Console verification token ready? If not, I'll wire them as env vars with placeholders you can fill later.
4. **Legal page content** — Privacy / Terms / Refund / Shipping policies need real business details (legal entity name, address, GSTIN, support email/phone, shipping zones & SLAs, refund window). Share these, or I'll publish review-ready templates with `[PLACEHOLDER]` markers you must fill before launch.

---

### Phase 1 — Security & Auth (highest priority)

- Restore the `_authenticated` route gate (Supabase `getUser()` + redirect to `/auth`).
- Add `super_admin` to the `app_role` enum; keep `admin` and `customer`. Migration: seed first Super Admin role via SQL keyed off the email you give me.
- Re-add `requireSupabaseAuth` middleware + `has_role(uid, 'admin' OR 'super_admin')` check to every `admin.functions.ts` handler. Destructive ops (delete user, change roles) gated to `super_admin`.
- Tighten RLS on `coupons` — remove broad authenticated SELECT; coupon validation moves to a server fn that returns only `{ valid, discount }`.
- Audit RLS on `orders`, `addresses`, `wishlist`, `profiles`, `user_roles`, `blog_posts`, `gift_hampers`, storage bucket — verify no public write paths.
- Confirm secrets (`SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`) are env-only; remove any literals.
- Enable HIBP password check.

### Phase 2 — Homepage & UX polish

- Stronger hero headline + sub-copy + dual CTA; ensure mobile sizing.
- Trust badge strip already exists — expand to 4 badges (100% Natural, No Preservatives, Freshly Made, Secure Payments) with icons.
- Verify testimonials + featured products sections render; tighten spacing/typography tokens.

### Phase 3 — Product detail upgrades

- DB: add `product_images` (multi-image gallery), `nutrition_facts` JSONB, `ingredients`, `storage_instructions`, `shelf_life`, `delivery_eta` columns; `product_reviews` table (auth users, 1 review per product, admin moderation).
- PDP: image gallery with zoom (existing `aspect-ratio` + a lightweight zoom-on-hover), nutrition table, ingredients, storage, shelf life, delivery ETA, reviews list + form, "Related products" (same category), "Frequently bought together" (top 2 co-purchased or curated by admin).
- Admin: edit all new fields + manage gallery + moderate reviews.

### Phase 4 — Cart & checkout

- Cart: shipping estimate by pincode (flat tiers: free >₹999, ₹79 metro, ₹129 rest of India), coupon input wired to new server fn, "You might also like" rail.
- Guest checkout: 3-step indicator (Address → Review → Confirm). Persist guest order with email; link to account on later sign-up by email match.
- Order confirmation email via Lovable Emails (if approved in Decision 2).

### Phase 5 — SEO

- Unique `head()` per route (title, description, og:*, canonical) using `https://asli-swad-delights.lovable.app`.
- Product JSON-LD schema on PDP from loader data.
- Update `sitemap.xml` BASE_URL; verify robots.txt.
- Sweep all `<img>` for descriptive alt text.

### Phase 6 — Performance

- Convert hero/product images to responsive `srcset`, lazy-load below-the-fold.
- Replace any heavy components with dynamic imports where appropriate.
- Verify route-level code splitting (TanStack does this automatically per route).

### Phase 7 — Legal & business pages

- New routes: `/privacy`, `/terms`, `/refund-policy`, `/shipping-policy`. Linked from footer.
- Verify `/contact` and `/faq` exist and are complete.

### Phase 8 — Analytics

- GA4: inject via `head()` in `__root.tsx` using `VITE_GA_MEASUREMENT_ID` (no-op if unset).
- Meta Pixel: same pattern with `VITE_META_PIXEL_ID`.
- GSC verification: `<meta name="google-site-verification">` from `VITE_GSC_VERIFICATION`.

### Phase 9 — Production readiness report

Markdown report at `/mnt/documents/production-readiness-report.md` covering all checklists you asked for + an overall score.

---

### Technical details (skip if not interested)

- Server functions in `src/lib/*.functions.ts` import `requireSupabaseAuth` and call `has_role` RPC via `context.supabase`. Storage uploads keep using `supabaseAdmin` loaded inside handler bodies.
- New `_authenticated/route.tsx` restores the `supabase.auth.getUser()` gate; `attachSupabaseAuth` already registered in `src/start.ts`.
- Coupon validation server fn signature: `validateCoupon({ code, subtotal }) → { valid, discount_inr, reason? }`. The `coupons` table SELECT policy becomes "service role + admins only".
- Reviews: `product_reviews(user_id, product_id, rating, body, status)` with RLS — authors read/write own; everyone reads `status='approved'`; admins manage all.
- Email: if approved, Lovable Emails auth flow + a transactional `order_confirmation` template.

---

### What I'll do once you reply

If you answer the 4 decisions (even briefly — e.g. "use admin@healthydelights.com / generate password / yes scaffold emails / use placeholders for legal"), I'll execute Phases 1→9 in order and deliver the report at the end.

If you'd rather I just proceed with sensible defaults, say "go" and I'll: generate a Super Admin password and show it once, scaffold Lovable Emails (you'll need to add DNS after), wire analytics as empty env vars, and publish legal pages with `[PLACEHOLDER]` markers.