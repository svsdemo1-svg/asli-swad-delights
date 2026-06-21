import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { listProducts } from "@/lib/catalog.functions";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import type { Product } from "@/lib/types";

const productsQuery = queryOptions<Product[]>({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Shop Healthy Laddoos & Traditional Snacks — Healthy Delights" },
      {
        name: "description",
        content:
          "Browse handcrafted laddoos, panjiri and traditional nutrition mixes. Sugar-free, sattu, ragi, dry-fruit, gond ke laddoo & more — preservative-free, delivered across India.",
      },
      { property: "og:title", content: "Shop — Healthy Delights" },
      { property: "og:description", content: "Premium handmade healthy Indian snacks." },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="grid min-h-[40vh] place-items-center text-sm text-brand-brown/70">{error.message}</div>
    </AppShell>
  ),
  notFoundComponent: () => <div className="p-8 text-center">Not found</div>,
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    products.forEach((p) => {
      if (p.categories) seen.set(p.categories.slug, p.categories.name);
    });
    return Array.from(seen, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.categories?.slug !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.short_description.toLowerCase().includes(q) &&
          !p.ingredients.some((i) => i.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [products, query, category]);

  return (
    <AppShell>
      <section className="bg-brand-cream px-5 pt-12 pb-6">
        <SectionHeading
          eyebrow="The Pantry"
          title="All Products"
          subtitle="Thirteen handcrafted recipes — every one preservative-free, every one rooted in tradition."
        />
        <div className="mx-auto max-w-3xl">
          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-brand-brown/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search laddoos, ingredients…"
              className="w-full rounded-full bg-white py-3 pr-5 pl-11 text-sm text-brand-brown ring-1 ring-brand-brown/10 outline-none focus:ring-brand-gold"
            />
          </div>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
            <FilterChip
              label="All"
              active={category === "all"}
              onClick={() => setCategory("all")}
            />
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                label={c.name}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-beige/30 px-5 py-10">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-brand-brown/60">
            No products match your search.
          </p>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
        active
          ? "bg-brand-brown text-brand-cream"
          : "bg-brand-cream text-brand-brown/70 ring-1 ring-brand-brown/10"
      }`}
    >
      {label}
    </button>
  );
}
