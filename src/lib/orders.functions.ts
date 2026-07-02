import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().min(1).max(200),
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  imageKey: z.string().min(1).max(500),
  weightGrams: z.number().int().min(0).max(100000),
  price: z.number().min(0).max(1000000),
  qty: z.number().int().min(1).max(100),
  kind: z.enum(["product", "hamper"]).optional().default("product"),
});

const paymentSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("cod") }),
  z.object({
    method: z.literal("razorpay"),
    razorpay_order_id: z.string().min(1).max(80),
    razorpay_payment_id: z.string().min(1).max(80),
    razorpay_signature: z.string().min(1).max(200),
  }),
]);

const placeOrderSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  address: z.object({
    full_name: z.string().min(1).max(100),
    mobile: z.string().min(4).max(20),
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional().default(""),
    city: z.string().min(1).max(80),
    state: z.string().min(1).max(80),
    pincode: z.string().min(4).max(10),
  }),
  coupon_code: z.string().trim().max(40).optional().default(""),
  notes: z.string().max(500).optional().default(""),
  payment: paymentSchema.optional().default({ method: "cod" }),
});

function computeDiscount(
  subtotal: number,
  coupon: { discount_type: string; value: number; min_order_inr: number } | null,
): number {
  if (!coupon) return 0;
  if (subtotal < Number(coupon.min_order_inr)) return 0;
  if (coupon.discount_type === "percent") {
    return Math.round((subtotal * Number(coupon.value)) / 100);
  }
  return Math.min(Number(coupon.value), subtotal);
}

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ code: z.string().trim().min(1).max(40), subtotal: z.number().min(0) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (!row) return { valid: false as const, message: "Invalid coupon code" };
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return { valid: false as const, message: "This coupon has expired" };
    }
    if (data.subtotal < Number(row.min_order_inr)) {
      return {
        valid: false as const,
        message: `Minimum order ₹${row.min_order_inr} required for this coupon`,
      };
    }
    const discount = computeDiscount(data.subtotal, row);
    void context;
    return {
      valid: true as const,
      code: row.code,
      discount,
      discount_type: row.discount_type,
      value: Number(row.value),
    };
  });

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => placeOrderSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);

    let discount = 0;
    let appliedCode: string | null = null;
    if (data.coupon_code) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", data.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date())) {
        discount = computeDiscount(subtotal, coupon);
        appliedCode = coupon.code;
      }
    }
    const shipping = subtotal >= 999 ? 0 : 49;
    const total = Math.max(0, subtotal - discount + shipping);

    // Verify Razorpay payment signature server-side before persisting the order.
    let paymentMethod: "cod" | "razorpay" = "cod";
    let razorpayPaymentId: string | null = null;
    let razorpayOrderId: string | null = null;
    if (data.payment.method === "razorpay") {
      const { verifyRazorpaySignature } = await import("./payments.functions");
      const ok = await verifyRazorpaySignature({
        razorpay_order_id: data.payment.razorpay_order_id,
        razorpay_payment_id: data.payment.razorpay_payment_id,
        razorpay_signature: data.payment.razorpay_signature,
      });
      if (!ok) throw new Error("Payment signature verification failed");
      paymentMethod = "razorpay";
      razorpayPaymentId = data.payment.razorpay_payment_id;
      razorpayOrderId = data.payment.razorpay_order_id;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        subtotal_inr: subtotal,
        discount_inr: discount,
        shipping_inr: shipping,
        total_inr: total,
        coupon_code: appliedCode,
        payment_method: paymentMethod,
        status: paymentMethod === "razorpay" ? "confirmed" : "pending",
        notes: [
          data.notes || "",
          razorpayPaymentId ? `Razorpay: ${razorpayOrderId} / ${razorpayPaymentId}` : "",
        ].filter(Boolean).join(" | ") || null,
        ship_full_name: data.address.full_name,
        ship_mobile: data.address.mobile,
        ship_line1: data.address.line1,
        ship_line2: data.address.line2 || null,
        ship_city: data.address.city,
        ship_state: data.address.state,
        ship_pincode: data.address.pincode,
      })
      .select()
      .single();
    if (error || !order) throw new Error(error?.message ?? "Could not place order");

    const itemRows = data.items.map((i) => ({
      order_id: order.id,
      product_name: i.name,
      product_slug: i.slug,
      image_key: i.imageKey,
      weight_grams: i.weightGrams,
      unit_price_inr: i.price,
      quantity: i.qty,
      line_total_inr: i.price * i.qty,
      kind: i.kind ?? "product",
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(itemRows);
    if (itemsErr) throw new Error(itemsErr.message);

    // Fire-and-forget order confirmation email via Resend (test sender).
    // Configure a custom verified domain in Resend before production launch.
    const resendKey = process.env.RESEND_API_KEY;
    const recipient = context.claims?.email as string | undefined;
    if (resendKey && recipient) {
      try {
        const itemLines = data.items
          .map((i) => `<tr><td style="padding:6px 0">${i.name} × ${i.qty}</td><td align="right">₹${i.price * i.qty}</td></tr>`)
          .join("");
        const html = `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;color:#3b2a1e">
            <h2 style="font-family:Georgia,serif">Thank you for your order!</h2>
            <p>Hi ${data.address.full_name}, we've received your order <strong>#${order.order_number}</strong> and are preparing it fresh.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
              ${itemLines}
              <tr><td style="padding-top:10px;border-top:1px solid #eee">Subtotal</td><td align="right" style="padding-top:10px;border-top:1px solid #eee">₹${subtotal}</td></tr>
              ${discount > 0 ? `<tr><td>Discount (${appliedCode})</td><td align="right">-₹${discount}</td></tr>` : ""}
              <tr><td>Shipping</td><td align="right">${shipping === 0 ? "Free" : `₹${shipping}`}</td></tr>
              <tr><td style="font-weight:bold;padding-top:6px">Total</td><td align="right" style="font-weight:bold;padding-top:6px">₹${total}</td></tr>
            </table>
            <p style="font-size:13px;color:#7a6858">Shipping to:<br/>${data.address.line1}, ${data.address.line2 ? data.address.line2 + ", " : ""}${data.address.city}, ${data.address.state} - ${data.address.pincode}</p>
            <p>— Menka Singh, Healthy Delights</p>
          </div>`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "Healthy Delights <onboarding@resend.dev>",
            to: [recipient],
            subject: `Order confirmed · #${order.order_number}`,
            html,
          }),
        });
      } catch (e) {
        console.error("[orders] email send failed", e);
      }
    }

    return { id: order.id, order_number: order.order_number };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return order;
  });
