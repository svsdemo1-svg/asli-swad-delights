import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { listWishlist, toggleWishlistItem, mergeWishlist } from "@/lib/wishlist.functions";
import { getProductImage } from "@/lib/product-images";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "My wishlist — Healthy Delights" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWishlist);
  const toggleFn = useServerFn(toggleWishlistItem);
  const mergeFn = useServerFn(mergeWishlist);
  const addToCart = useCart((s) => s.addToCart);
  const localWishlist = useCart((s) => s.wishlist);
  const setWishlist = useCart((s) => s.setWishlist);

  // Merge local wishlist into DB on first load.
  useEffect(() => {
    if (localWishlist.length > 0) {
      mergeFn({ data: { slugs: localWishlist } }).then(() => {
        setWishlist([]);
        qc.invalidateQueries({ queryKey: ["wishlist"] });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wishQ = useQuery({ queryKey: ["wishlist"], queryFn: () => listFn() });

  const removeM = useMutation({
    mutationFn: (id: string) => toggleFn({ data: { product_id: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const items = wishQ.data ?? [];

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-6 font-serif text-3xl font-bold text-brand-brown">My Wishlist</h1>
        {items.length === 0 ? (
          <div className="rounded-3xl bg-brand-beige/40 p-12 text-center">
            <Heart className="mx-auto mb-4 size-8 text-brand-brown/40" />
            <p className="mb-5 font-serif text-xl text-brand-brown">No saved products yet.</p>
            <Link to="/products" className="inline-block rounded-full bg-brand-brown px-6 py-3 text-xs font-bold uppercase tracking-widest text-brand-cream">
              Browse the pantry
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.id} className="flex gap-4 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/5">
                <img src={getProductImage(p.image_key)} alt={p.name} className="size-20 rounded-xl object-cover" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to="/products/$slug" params={{ slug: p.slug }} className="truncate font-serif font-bold text-brand-brown">
                    {p.name}
                  </Link>
                  <span className="text-xs text-brand-brown/60">{p.weight_grams}g · {formatINR(p.price_inr)}</span>
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => {
                        addToCart({ productId: p.id, slug: p.slug, name: p.name, price: Number(p.price_inr), imageKey: p.image_key, weightGrams: p.weight_grams });
                        toast.success("Added to bag");
                      }}
                      className="rounded-full bg-brand-brown px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-cream"
                    >
                      Add to bag
                    </button>
                    <button
                      onClick={() => removeM.mutate(p.id)}
                      className="rounded-full bg-brand-beige/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-brown"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
