import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listProducts, listTestimonials } from "@/lib/catalog.functions";
import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBadgeStrip } from "@/components/TrustBadgeStrip";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { HealthBenefits } from "@/components/sections/HealthBenefits";
import { HeritageSection } from "@/components/sections/HeritageSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { Newsletter } from "@/components/sections/Newsletter";
import type { Product, Testimonial } from "@/lib/types";

const productsQuery = queryOptions<Product[]>({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});
const testimonialsQuery = queryOptions<Testimonial[]>({
  queryKey: ["testimonials"],
  queryFn: () => listTestimonials(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Healthy Delights — Asli Dadi Nani Ka Swad | Handmade Laddoos & Panjiri" },
      {
        name: "description",
        content:
          "Premium handcrafted laddoos, Punjab Di Panjiri & traditional Indian snacks. 100% natural, no preservatives, made with A2 ghee & authentic Dadi-Nani recipes.",
      },
      { property: "og:title", content: "Healthy Delights — Asli Dadi Nani Ka Swad" },
      {
        property: "og:description",
        content: "Handcrafted healthy laddoos, panjiri & traditional snacks by Menka Singh.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Healthy Delights",
          description: "Handcrafted traditional Indian healthy laddoos, panjiri and nutritious snacks.",
          founder: { "@type": "Person", name: "Menka Singh" },
          slogan: "Asli Dadi Nani Ka Swad",
        }),
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(testimonialsQuery);
  },
  errorComponent: HomeError,
  notFoundComponent: () => <div className="p-8 text-center">Not found</div>,
  component: HomePage,
});

function HomeError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <p className="mb-2 font-serif text-2xl text-brand-brown">We couldn't load the kitchen.</p>
        <p className="mb-4 text-sm text-brand-brown/60">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="rounded-full bg-brand-brown px-6 py-2 text-xs font-bold uppercase tracking-widest text-brand-cream"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);
  const featured = products.filter((p) => p.is_featured);

  return (
    <AppShell>
      <HeroSection />
      <TrustBadgeStrip />
      <WhyChooseUs />
      <FeaturedProducts products={featured} />
      <HealthBenefits />
      <HeritageSection />
      <TestimonialsSection testimonials={testimonials} />
      <Newsletter />
    </AppShell>
  );
}

// Track home view for analytics/recently-viewed prep
export function _noop() { useEffect(() => {}, []); }
