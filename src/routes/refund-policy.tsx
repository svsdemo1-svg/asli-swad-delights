import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

const CANONICAL = "https://asli-swad-delights.lovable.app/refund-policy";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy — Healthy Delights" },
      { name: "description", content: "Our refund and cancellation policy for perishable handmade food products." },
      { property: "og:title", content: "Refund & Cancellation Policy — Healthy Delights" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <AppShell>
      <article className="prose prose-sm mx-auto max-w-3xl px-5 py-16 text-brand-brown">
        <h1 className="font-serif text-3xl font-bold">Refund & Cancellation Policy</h1>
        <p className="text-xs uppercase tracking-widest text-brand-brown/60">
          Last updated: [FILL BEFORE LAUNCH]
        </p>
        <h2>1. Cancellations</h2>
        <p>
          Orders can be cancelled free of charge within [FILL BEFORE LAUNCH — e.g., 2 hours] of
          placement, provided they have not yet entered production.
        </p>
        <h2>2. Returns</h2>
        <p>
          As our products are perishable, freshly-made food items, we cannot accept returns for
          reasons other than damage or quality issues.
        </p>
        <h2>3. Damaged or defective products</h2>
        <p>
          If your order arrives damaged or defective, please email photos to
          <strong> [FILL BEFORE LAUNCH — support email]</strong> within 24 hours of delivery. We
          will replace the item or refund the amount at our discretion.
        </p>
        <h2>4. Refund timeline</h2>
        <p>
          Approved refunds are processed within [FILL BEFORE LAUNCH — e.g., 5–7 business days] to
          the original payment method.
        </p>
        <h2>5. Non-refundable</h2>
        <ul>
          <li>Change of mind after dispatch.</li>
          <li>Products consumed in full.</li>
          <li>Delays caused by incorrect address or courier issues beyond our control.</li>
        </ul>
        <h2>6. Contact</h2>
        <p>[FILL BEFORE LAUNCH — support email, phone]</p>
      </article>
    </AppShell>
  );
}
