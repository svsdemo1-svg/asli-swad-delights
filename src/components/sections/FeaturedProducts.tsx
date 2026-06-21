import { Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

interface Props {
  products: Product[];
}

export function FeaturedProducts({ products }: Props) {
  return (
    <section className="bg-brand-beige/30 px-5 py-16">
      <SectionHeading
        eyebrow="Curated Selection"
        title="Featured Delicacies"
        subtitle="Six handcrafted favourites from our pantry — start with what our community loves most."
      />
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          to="/products"
          className="inline-block rounded-full border border-brand-brown px-8 py-3 text-xs font-bold uppercase tracking-widest text-brand-brown transition-colors hover:bg-brand-brown hover:text-brand-cream"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}
