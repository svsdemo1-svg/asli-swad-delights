import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// NOTE: Auth temporarily disabled per user request. All admin server fns
// run with service-role privileges and NO caller verification. Re-enable by
// restoring `.middleware([requireSupabaseAuth])` + assertAdmin checks.

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const checkAdmin = createServerFn({ method: "GET" }).handler(async () => {
  return { isAdmin: true };
});

// ============ DASHBOARD ============
export const adminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const monthAgo = new Date(today.getTime() - 30 * 86400000).toISOString();
  const [orders, ordersToday, ordersMonth, subs, contacts, inquiries, products] = await Promise.all([
    sb.from("orders").select("total_inr,status", { count: "exact" }),
    sb.from("orders").select("total_inr").gte("created_at", dayStart),
    sb.from("orders").select("total_inr").gte("created_at", monthAgo),
    sb.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    sb.from("contact_messages").select("id", { count: "exact", head: true }),
    sb.from("corporate_inquiries").select("id", { count: "exact", head: true }),
    sb.from("products").select("id", { count: "exact", head: true }),
  ]);
  const sum = (rows: Array<{ total_inr: number | string }> | null) =>
    (rows ?? []).reduce((s, r) => s + Number(r.total_inr), 0);
  return {
    orderCount: orders.count ?? 0,
    revenueToday: sum(ordersToday.data as never),
    revenueMonth: sum(ordersMonth.data as never),
    subscriberCount: subs.count ?? 0,
    contactCount: contacts.count ?? 0,
    inquiryCount: inquiries.count ?? 0,
    productCount: products.count ?? 0,
    pendingOrders: (orders.data ?? []).filter((o) => o.status === "pending").length,
  };
});

// ============ PRODUCTS ============
const productUpdate = z.object({
  id: z.string().uuid(),
  price_inr: z.number().min(0).max(1000000).optional(),
  weight_grams: z.number().int().min(0).max(100000).optional(),
  image_key: z.string().min(1).max(2000).optional(),
  in_stock: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
  short_description: z.string().max(500).optional(),
  long_description: z.string().max(5000).optional(),
});

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => productUpdate.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { id, ...patch } = data;
    const { error } = await sb.from("products").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ IMAGE UPLOAD ============
const uploadSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  dataBase64: z.string().min(1).max(8_000_000), // ~6MB binary
});

export const adminUploadProductImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const { error: upErr } = await sb.storage
      .from("product-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (upErr) throw new Error(upErr.message);
    // Long-lived signed URL (10 years)
    const { data: signed, error: sErr } = await sb.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (sErr || !signed) throw new Error(sErr?.message ?? "Failed to sign URL");
    return { url: signed.signedUrl, path };
  });

// ============ ORDERS ============
export const adminListOrders = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ HAMPERS ============
const hamperSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  occasion: z.string().max(40),
  price_inr: z.number().min(0).max(1000000),
  image_key: z.string().min(1).max(2000),
  contents: z.array(z.string().max(200)).max(20),
  is_published: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

export const adminListHampers = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb.from("gift_hampers").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminUpsertHamper = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => hamperSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const payload = { ...data, contents: data.contents };
    if (data.id) {
      const { error } = await sb.from("gift_hampers").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb.from("gift_hampers").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteHamper = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("gift_hampers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ BLOG ============
const postSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500),
  body_markdown: z.string().max(50000),
  cover_image_key: z.string().min(1).max(2000),
  author: z.string().max(100).optional().default("Menka Singh"),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(500).optional().nullable(),
  is_published: z.boolean().optional().default(true),
});

export const adminListPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb.from("blog_posts").select("*").order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminUpsertPost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => postSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    if (data.id) {
      const { error } = await sb.from("blog_posts").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb.from("blog_posts").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ COUPONS ============
const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1).max(40),
  discount_type: z.enum(["percent", "flat"]),
  value: z.number().min(0).max(100000),
  min_order_inr: z.number().min(0).max(1000000).optional().default(0),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const adminListCoupons = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminUpsertCoupon = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => couponSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const payload = { ...data, code: data.code.toUpperCase() };
    if (data.id) {
      const { error } = await sb.from("coupons").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb.from("coupons").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteCoupon = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ INQUIRIES ============
export const adminListInquiries = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const [contacts, corp, subs] = await Promise.all([
    sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200),
    sb.from("corporate_inquiries").select("*").order("created_at", { ascending: false }).limit(200),
    sb.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(500),
  ]);
  return {
    contacts: contacts.data ?? [],
    corporate: corp.data ?? [],
    subscribers: subs.data ?? [],
  };
});

// Deprecated: auth disabled, no role claim needed.
export const claimFirstAdmin = createServerFn({ method: "POST" }).handler(async () => {
  return { ok: true, message: "Auth is disabled — admin panel is open." };
});
