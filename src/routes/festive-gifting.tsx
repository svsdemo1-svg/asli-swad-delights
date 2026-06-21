import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";

const occasions = [
  { name: "Diwali", desc: "Glow-up gifting with our festive Diwali hampers.", emoji: "🪔" },
  { name: "Raksha Bandhan", desc: "Sweet, healthy and thoughtful — for siblings.", emoji: "🪢" },
  { name: "New Year", desc: "A wellness start to the year, lovingly packed.", emoji: "✨" },
  { name: "Weddings", desc: "Premium return-gift hampers in eco-friendly boxes.", emoji: "💍" },
  { name: "Family Celebrations", desc: "Birthdays, anniversaries, just-because moments.", emoji: "🎉" },
  { name: "Housewarmings", desc: "A sweet welcome to a new home.", emoji: "🏡" },
];

export const Route = createFileRoute("/festive-gifting")({
  head: () => ({
    meta: [
      { title: "Festive Gifting Hampers — Healthy Delights" },
      {
        name: "description",
        content: "Curated festive gifting hampers for Diwali, Raksha Bandhan, weddings and more — handmade healthy laddoos in premium packaging.",
      },
      { property: "og:title", content: "Festive Gifting — Healthy Delights" },
      { property: "og:url", content: "/festive-gifting" },
    ],
    links: [{ rel: "canonical", href: "/festive-gifting" }],
  }),
  component: FestivePage,
});

function FestivePage() {
  return (
    <AppShell>
      <section className="bg-brand-cream px-6 pt-12 pb-6">
        <SectionHeading
          eyebrow="Festive Gifting"
          title="A healthier way to celebrate"
          subtitle="Hand-curated hampers of our finest laddoos and panjiri — wrapped in eco-friendly packaging."
        />
      </section>
      <section className="bg-brand-beige/30 px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {occasions.map((o) => (
            <div
              key={o.name}
              className="rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/5 animate-fade-in-up"
            >
              <div className="mb-3 text-3xl">{o.emoji}</div>
              <h3 className="mb-1 font-serif text-lg font-bold text-brand-brown">{o.name}</h3>
              <p className="text-sm text-brand-brown/70">{o.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/corporate-gifting"
            className="inline-block rounded-full bg-brand-brown px-8 py-3 text-xs font-bold uppercase tracking-widest text-brand-cream"
          >
            Enquire for custom hampers
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
