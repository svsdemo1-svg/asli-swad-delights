import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Product, Testimonial } from "./types";

function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase environment variables");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const listProducts = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("products")
    .select("*, categories(slug,name)")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }): Promise<Product | null> => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("products")
      .select("*, categories(slug,name)")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as Product | null) ?? null;
  });

export const listTestimonials = createServerFn({ method: "GET" }).handler(async (): Promise<Testimonial[]> => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Testimonial[];
});

const newsletterSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(100).optional(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => newsletterSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb
      .from("newsletter_subscribers")
      .insert({ email: data.email, name: data.name ?? null });
    if (error && !/duplicate/i.test(error.message)) throw new Error(error.message);
    return { ok: true };
  });

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(254),
  mobile: z.string().max(20).optional(),
  message: z.string().trim().min(1).max(2000),
});

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      mobile: data.mobile ?? null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const corporateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  company_name: z.string().trim().min(1).max(150),
  email: z.string().email().max(254),
  mobile: z.string().trim().min(4).max(20),
  requirement: z.string().trim().min(1).max(2000),
});

export const sendCorporateInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => corporateSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("corporate_inquiries").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
