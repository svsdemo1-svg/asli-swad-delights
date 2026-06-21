import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Minus, ShoppingBag, Heart, Check } from "lucide-react";
import { getProduct, listProducts } from "@/lib/catalog.functions";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { AppShell } from "@/components/layout/AppShell";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const productQuery = (slug: string) =>
  queryOptions<Product | null>({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
  });
const allProductsQuery = queryOptions<Product[]>({
  queryKey: ["products"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!product) throw notFound();
    context.queryClient.ensureQueryData(allProductsQuery);
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — ${formatINR(p.price_inr)} | Healthy Delights` : "Product";
    const desc = p ? p.short_description : "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: p ? `/products/${p.slug}` : "/products" },
      ],
      links: p ? [{ rel: "canonical", href: `/products/${p.slug}` }] : [],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: p.name,
                description: p.short_description,
                brand: { "@type": "Brand", name: "Healthy Delights" },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "INR",
                  price: String(p.price_inr),
                  availability: p.in_stock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                },
              }),
            },
          ]
        : [],
    };
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="grid min-h-[40vh] place-items-center text-sm text-brand-brown/70">{error.message}</div>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <div className="grid min-h-[40vh] place-items-center px-6 text-center">
        <div>
          <p className="mb-3 font-serif text-3xl text-brand-brown">Recipe not found</p>
          <Link to="/products" className="text-sm font-bold uppercase tracking-widest text-brand-gold">
            View all products
          </Link>
        </div>
      </div>
    </AppShell>
  ),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: all } = useSuspenseQuery(allProductsQuery);
  const [qty, setQty] = useState(1);
  const addToCart = useCart((s) => s.addToCart);
  const toggleWishlist = useCart((s) => s.toggleWishlist);
  const wished = useCart((s) => s.wishlist.includes(slug));
  const trackView = useCart((s) => s.trackView);

  useEffect(() => {
    if (product) trackView(product.slug);
  }, [product, trackView]);

  if (!product) return null;
  const related = all.filter((p) => p.id !== product.id && p.category_id === product.category_id).slice(0, 3);

  return (
    <AppShell>
      <section className="px-5 py-8">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] bg-brand-beige/40 ring-1 ring-brand-brown/5">
            <img
              src={getProductImage(product.image_key)}
              alt={product.name}
              width={768}
              height={768}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div>
            <Link to="/products" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
              ← All products
            </Link>
            <h1 className="mt-2 font-serif text-3xl font-bold text-brand-brown md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm italic text-brand-brown/70">{product.short_description}</p>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-serif text-3xl text-brand-gold">{formatINR(product.price_inr)}</span>
              <span className="text-sm text-brand-brown/60">/ {product.weight_grams}g</span>
              {product.is_best_seller && (
                <span className="ml-auto rounded-full bg-brand-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                  Best Seller
                </span>
              )}
            </div>

            <div className="mt-7 flex items-center gap-3">
              <div className="flex items-center rounded-full bg-brand-beige/50 ring-1 ring-brand-brown/10">
                <button
                  className="grid size-11 place-items-center text-brand-brown"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold">{qty}</span>
                <button
                  className="grid size-11 place-items-center text-brand-brown"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  addToCart(
                    {
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price_inr,
                      imageKey: product.image_key,
                      weightGrams: product.weight_grams,
                    },
                    qty,
                  );
                  toast.success(`Added ${qty} × ${product.name} to bag`);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-brown py-3.5 text-xs font-bold uppercase tracking-widest text-brand-cream"
              >
                <ShoppingBag className="size-4" /> Add to Bag
              </button>
              <button
                onClick={() => toggleWishlist(product.slug)}
                aria-label="Toggle wishlist"
                className="grid size-11 place-items-center rounded-full border border-brand-brown/20 text-brand-brown"
              >
                <Heart className={`size-4 ${wished ? "fill-brand-gold text-brand-gold" : ""}`} />
              </button>
            </div>

            {product.long_description && (
              <p className="mt-8 text-sm leading-relaxed text-brand-brown/80">
                {product.long_description}
              </p>
            )}

            <DetailGroup title="Ingredients">
              <ul className="flex flex-wrap gap-2">
                {product.ingredients.map((i) => (
                  <li
                    key={i}
                    className="rounded-full bg-brand-beige/60 px-3 py-1 text-[11px] text-brand-brown/80"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            </DetailGroup>

            <DetailGroup title="Health Benefits">
              <ul className="space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-2 text-sm text-brand-brown/80">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-green" /> {b}
                  </li>
                ))}
              </ul>
            </DetailGroup>

            {product.suitable_for.length > 0 && (
              <DetailGroup title="Suitable For">
                <div className="flex flex-wrap gap-2">
                  {product.suitable_for.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-brand-brown/15 px-3 py-1 text-[11px] font-medium text-brand-brown/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </DetailGroup>
            )}

            {Object.keys(product.nutritional_info).length > 0 && (
              <DetailGroup title="Nutritional Information (per 100g)">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(product.nutritional_info).map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-brand-beige/40 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">
                        {k}
                      </div>
                      <div className="mt-1 font-serif text-sm text-brand-brown">{v}</div>
                    </div>
                  ))}
                </div>
              </DetailGroup>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-brand-beige/30 px-5 py-14">
          <h2 className="mb-6 text-center font-serif text-2xl text-brand-brown">You may also love</h2>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-brand-brown/10 pt-5">
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-brand-brown/70">
        {title}
      </h3>
      {children}
    </div>
  );
}
