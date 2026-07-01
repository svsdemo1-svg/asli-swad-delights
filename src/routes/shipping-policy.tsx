import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

const CANONICAL = "https://asli-swad-delights.lovable.app/shipping-policy";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Healthy Delights" },
      { name: "description", content: "Shipping zones, timelines and charges for Healthy Delights orders." },
      { property: "og:title", content: "Shipping Policy — Healthy Delights" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <AppShell>
      <article className="prose prose-sm mx-auto max-w-3xl px-5 py-16 text-brand-brown">
        <h1 className="font-serif text-3xl font-bold">Shipping Policy</h1>
        <p className="text-xs uppercase tracking-widest text-brand-brown/60">
          Last updated: [FILL BEFORE LAUNCH]
        </p>
        <h2>1. Where we ship</h2>
        <p>
          We currently ship across India via [FILL BEFORE LAUNCH — courier partner]. International
          shipping is available on request — please contact us.
        </p>
        <h2>2. Charges</h2>
        <ul>
          <li>Orders above ₹999 — <strong>Free shipping</strong></li>
          <li>Metro cities — ₹[FILL BEFORE LAUNCH]</li>
          <li>Rest of India — ₹[FILL BEFORE LAUNCH]</li>
        </ul>
        <h2>3. Timelines</h2>
        <ul>
          <li>Processing: 1–2 business days (products are made-to-order for freshness).</li>
          <li>Metro delivery: 2–4 business days after dispatch.</li>
          <li>Rest of India: 4–7 business days after dispatch.</li>
        </ul>
        <h2>4. Tracking</h2>
        <p>You will receive a tracking link via email once your order is dispatched.</p>
        <h2>5. Delivery issues</h2>
        <p>
          Please provide a correct address and reachable phone number. Failed deliveries due to
          incorrect details may attract re-shipping charges.
        </p>
        <h2>6. Contact</h2>
        <p>[FILL BEFORE LAUNCH — support email, phone]</p>
      </article>
    </AppShell>
  );
}
