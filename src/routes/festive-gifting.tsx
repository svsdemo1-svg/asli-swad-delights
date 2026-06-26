import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";
import { listHampers } from "@/lib/hampers.functions";
import { getProductImage } from "@/lib/product-images";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/festive-gifting")({
  head: () => ({
    meta: [
      { title: "Festive Gifting Hampers — Healthy Delights" },
      { name: "description", content: "Curated festive gifting hampers for Diwali, Raksha Bandhan, weddings and more — handmade healthy laddoos in premium packaging." },
      { property: "og:title", content: "Festive Gifting — Healthy Delights" },
      { property: "og:url", content: "/festive-gifting" },
    ],
    links: [{ rel: "canonical", href: "/festive-gifting" }],
  }),
  component: FestivePage,
});

function FestivePage() {
  const fn = useServerFn(listHampers);
  const q = useQuery({ queryKey: ["hampers"], queryFn: () => fn({ data: {} }) });
  const hampers = (q.data ?? []).filter((h) => h.occasion !== "corporate");
  const addToCart = useCart((s) => s.addToCart);

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
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hampers.map((h) => {
            const contents = Array.isArray(h.contents) ? (h.contents as string[]) : [];
            return (
              <div key={h.id} className="overflow-hidden rounded-3xl bg-brand-cream ring-1 ring-brand-brown/5">
                <img src={getProductImage(h.image_key)} alt={h.name} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">{h.occasion}</span>
                  <h3 className="mt-1 mb-2 font-serif text-lg font-bold text-brand-brown">{h.name}</h3>
                  <p className="mb-3 text-sm text-brand-brown/70">{h.description}</p>
                  <ul className="mb-4 space-y-1 text-xs text-brand-brown/70">
                    {contents.map((c) => <li key={c}>· {c}</li>)}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-brand-brown">{formatINR(Number(h.price_inr))}</span>
                    <button
                      onClick={() => {
                        addToCart({
                          productId: `hamper-${h.id}`,
                          slug: h.slug,
                          name: h.name,
                          price: Number(h.price_inr),
                          imageKey: h.image_key,
                          weightGrams: 0,
                          kind: "hamper",
                        });
                        toast.success("Hamper added to bag");
                      }}
                      className="rounded-full bg-brand-brown px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-brand-cream"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {hampers.length === 0 && (
          <p className="mt-10 text-center text-sm text-brand-brown/60">More hampers landing soon.</p>
        )}
        <div className="mt-10 text-center">
          <Link
            to="/corporate-gifting"
            className="inline-block rounded-full bg-brand-brown px-8 py-3 text-xs font-bold uppercase tracking-widest text-brand-cream"
          >
            Need custom corporate hampers?
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
