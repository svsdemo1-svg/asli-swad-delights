import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";

const faqs = [
  {
    q: "Are your products preservative-free?",
    a: "Yes — every product is 100% free from artificial preservatives, colours and flavours.",
  },
  {
    q: "Are products handmade?",
    a: "Yes, we make every product in small batches by hand, using traditional Dadi-Nani techniques.",
  },
  {
    q: "Do you offer bulk and corporate orders?",
    a: "Absolutely. We do corporate gifting, festive hampers, and wholesale. Visit the Corporate Gifting page or message us on WhatsApp.",
  },
  {
    q: "How long do products stay fresh?",
    a: "Most laddoos stay fresh for 30–45 days in an airtight container at room temperature. Panjiri and seed-rich products last up to 60 days. Specific shelf-life is printed on the pack.",
  },
  {
    q: "Do you deliver across India?",
    a: "Yes — we ship pan-India through trusted courier partners. Standard delivery is 3–7 business days.",
  },
  {
    q: "What payment methods will be accepted?",
    a: "Online payments (UPI, cards, net banking, wallets) are coming soon. Until then, place your order on WhatsApp and we'll confirm payment & shipping details personally.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Healthy Delights" },
      {
        name: "description",
        content: "Answers to common questions about Healthy Delights — ingredients, shelf-life, delivery, bulk orders and payments.",
      },
      { property: "og:title", content: "FAQ — Healthy Delights" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <AppShell>
      <section className="px-6 pt-12 pb-16">
        <SectionHeading eyebrow="Good to know" title="Frequently Asked Questions" />
        <div className="mx-auto max-w-2xl space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-brand-cream p-5 ring-1 ring-brand-brown/10 open:bg-brand-beige/40"
            >
              <summary className="cursor-pointer list-none font-serif text-base font-bold text-brand-brown">
                <span className="float-right text-brand-gold transition-transform group-open:rotate-45">+</span>
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-brand-brown/80">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
