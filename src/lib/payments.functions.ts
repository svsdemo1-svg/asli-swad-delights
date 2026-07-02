import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Razorpay integration — mode is inferred from the key prefix
 * (`rzp_test_*` = test mode, `rzp_live_*` = live mode). Switching to live
 * only requires updating the RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET secrets.
 */

export const getPaymentConfig = createServerFn({ method: "GET" }).handler(async () => {
  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  return {
    enabled: Boolean(keyId && process.env.RAZORPAY_KEY_SECRET),
    keyId,
    mode: keyId.startsWith("rzp_live_") ? ("live" as const) : ("test" as const),
  };
});

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      amount_inr: z.number().int().min(1).max(10_000_000),
      receipt: z.string().max(40).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay is not configured");

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: data.amount_inr * 100, // paise
        currency: "INR",
        receipt: data.receipt ?? `rcpt_${Date.now()}`,
        payment_capture: 1,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Razorpay order creation failed: ${err}`);
    }
    const order = (await res.json()) as { id: string; amount: number; currency: string };
    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId };
  });

export async function verifyRazorpaySignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<boolean> {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const { createHmac, timingSafeEqual } = await import("crypto");
  const expected = createHmac("sha256", secret)
    .update(`${params.razorpay_order_id}|${params.razorpay_payment_id}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(params.razorpay_signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
