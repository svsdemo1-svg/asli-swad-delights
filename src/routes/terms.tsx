import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

const CANONICAL = "https://asli-swad-delights.lovable.app/terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Healthy Delights" },
      { name: "description", content: "The rules for using the Healthy Delights website and placing orders." },
      { property: "og:title", content: "Terms & Conditions — Healthy Delights" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <AppShell>
      <article className="prose prose-sm mx-auto max-w-3xl px-5 py-16 text-brand-brown">
        <h1 className="font-serif text-3xl font-bold">Terms & Conditions</h1>
        <p className="text-xs uppercase tracking-widest text-brand-brown/60">
          Last updated: [FILL BEFORE LAUNCH]
        </p>
        <h2>1. Acceptance</h2>
        <p>By using this site you agree to these terms. If you do not agree, please do not use the site.</p>
        <h2>2. Products</h2>
        <p>
          All products are handcrafted in small batches. Weights are approximate (±5g). Colour and
          texture may vary slightly from images.
        </p>
        <h2>3. Pricing & payment</h2>
        <p>
          All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated.
          Payment methods accepted: [FILL BEFORE LAUNCH].
        </p>
        <h2>4. Orders</h2>
        <p>
          We reserve the right to accept, reject or cancel any order at our discretion. In case of
          cancellation, the full amount will be refunded.
        </p>
        <h2>5. Intellectual property</h2>
        <p>All content, images and branding are owned by Healthy Delights.</p>
        <h2>6. Limitation of liability</h2>
        <p>
          Our liability is limited to the value of the order. We are not liable for indirect or
          consequential losses.
        </p>
        <h2>7. Governing law</h2>
        <p>These terms are governed by the laws of India. Jurisdiction: [FILL BEFORE LAUNCH].</p>
        <h2>8. Contact</h2>
        <p>[FILL BEFORE LAUNCH — legal entity, address, email]</p>
      </article>
    </AppShell>
  );
}
