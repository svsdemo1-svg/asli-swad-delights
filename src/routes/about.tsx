import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Menka Singh & Healthy Delights" },
      {
        name: "description",
        content:
          "Healthy Delights was founded by Menka Singh to bring traditional Indian nutrition back into modern lifestyles — 8+ years of slow-fire, family recipes.",
      },
      { property: "og:title", content: "About — Healthy Delights" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell>
      <section className="bg-brand-cream px-6 pt-12 pb-8">
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Our Story"
            title="Healthy traditions, modern lives."
            align="left"
          />
          <p className="mb-5 text-base leading-relaxed text-brand-brown/80">
            Healthy Delights was founded with a simple vision — to bring traditional Indian
            nutrition back into modern lifestyles. With over <strong>8 years of experience</strong>{" "}
            in healthy snacks and nutrition-focused food products,{" "}
            <strong>Menka Singh</strong> has created recipes that combine authentic taste with
            wellness.
          </p>
          <p className="mb-5 text-base leading-relaxed text-brand-brown/80">
            Our products are inspired by age-old family recipes passed down through generations,
            crafted with premium ingredients, pure A2 cow ghee and a refusal to use preservatives
            or artificial flavours.
          </p>
        </div>
      </section>

      <section className="bg-brand-brown px-6 py-16 text-brand-beige">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
          <div>
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.25em] text-brand-gold-soft">
              Vision
            </span>
            <h3 className="mb-3 font-serif text-2xl text-brand-cream">
              To become a trusted household name for healthy traditional snacks across India.
            </h3>
          </div>
          <div>
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.25em] text-brand-gold-soft">
              Mission
            </span>
            <h3 className="mb-3 font-serif text-2xl text-brand-cream">
              Deliver nutritious, delicious and authentic food products while maintaining
              uncompromising quality and purity.
            </h3>
          </div>
        </div>
      </section>

      <section className="bg-brand-beige/30 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h3 className="mb-6 text-center font-serif text-2xl text-brand-brown">What we stand for</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              "100% Natural",
              "No Preservatives",
              "Traditional Recipes",
              "Premium Ingredients",
              "Handmade Quality",
              "Sustainable Packaging",
              "Healthy Snacking",
              "No Artificial Flavours",
            ].map((v) => (
              <div
                key={v}
                className="rounded-2xl bg-brand-cream p-4 text-center text-xs font-bold uppercase tracking-wider text-brand-brown ring-1 ring-brand-brown/5"
              >
                ✧ {v}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
