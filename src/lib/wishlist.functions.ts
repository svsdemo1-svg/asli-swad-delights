import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wishlist")
      .select("product_id, products(id,slug,name,price_inr,image_key,weight_grams,short_description)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((r) => r.products)
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  });

export const toggleWishlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ product_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", data.product_id)
      .maybeSingle();
    if (existing) {
      await supabase.from("wishlist").delete().eq("id", existing.id);
      return { added: false };
    }
    await supabase.from("wishlist").insert({ user_id: userId, product_id: data.product_id });
    return { added: true };
  });

export const mergeWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slugs: z.array(z.string().max(120)).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.slugs.length === 0) return { merged: 0 };
    const { data: products } = await supabase
      .from("products")
      .select("id, slug")
      .in("slug", data.slugs);
    const rows = (products ?? []).map((p) => ({ user_id: userId, product_id: p.id }));
    if (rows.length === 0) return { merged: 0 };
    await supabase.from("wishlist").upsert(rows, { onConflict: "user_id,product_id" });
    return { merged: rows.length };
  });
