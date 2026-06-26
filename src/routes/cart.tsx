import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useCart } from "@/lib/cart-store";
import { getProductImage } from "@/lib/product-images";
import { formatINR } from "@/lib/format";

const PHONE = "919035066446";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Healthy Delights" },
      { name: "description", content: "Review your handpicked Healthy Delights selection." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.removeFromCart);
  const total = useCart((s) => s.totalAmount());

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      (i) => `• ${i.qty} × ${i.name} (${i.weightGrams}g) — ${formatINR(i.price * i.qty)}`,
    );
    return encodeURIComponent(
      `Hi! I'd like to place an order from Healthy Delights:\n\n${lines.join("\n")}\n\nTotal: ${formatINR(total)}`,
    );
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-2 font-serif text-3xl font-bold text-brand-brown">Your Bag</h1>
        <p className="mb-8 text-sm text-brand-brown/60">
          Online payments are coming soon. For now, place your order on WhatsApp and we'll confirm it personally.
        </p>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-brand-beige/40 p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 size-8 text-brand-brown/40" />
            <p className="mb-5 font-serif text-xl text-brand-brown">Your bag is empty.</p>
            <Link
              to="/products"
              className="inline-block rounded-full bg-brand-brown px-6 py-3 text-xs font-bold uppercase tracking-widest text-brand-cream"
            >
              Browse the pantry
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((i) => (
                <li
                  key={i.productId}
                  className="flex gap-4 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/5"
                >
                  <img
                    src={getProductImage(i.imageKey)}
                    alt={i.name}
                    width={96}
                    height={96}
                    loading="lazy"
                    className="size-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        to="/products/$slug"
                        params={{ slug: i.slug }}
                        className="truncate font-serif text-base font-bold text-brand-brown"
                      >
                        {i.name}
                      </Link>
                      <span className="shrink-0 text-sm font-bold text-brand-gold">
                        {formatINR(i.price * i.qty)}
                      </span>
                    </div>
                    <span className="mt-0.5 text-xs text-brand-brown/60">{i.weightGrams}g</span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full bg-brand-beige/60 px-1 py-1">
                        <button
                          onClick={() => setQty(i.productId, i.qty - 1)}
                          aria-label="Decrease"
                          className="grid size-7 place-items-center"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                        <button
                          onClick={() => setQty(i.productId, i.qty + 1)}
                          aria-label="Increase"
                          className="grid size-7 place-items-center"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(i.productId)}
                        aria-label="Remove"
                        className="text-brand-brown/50 hover:text-brand-brown"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-3xl bg-brand-brown p-6 text-brand-cream">
              <div className="mb-5 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Order Total
                </span>
                <span className="font-serif text-2xl">{formatINR(total)}</span>
              </div>
              <Link
                to="/checkout"
                className="block w-full rounded-full bg-brand-gold py-4 text-center text-xs font-bold uppercase tracking-widest text-brand-cream"
              >
                Proceed to Checkout
              </Link>
              <a
                href={`https://wa.me/${PHONE}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block w-full rounded-full border border-brand-cream/30 py-4 text-center text-xs font-bold uppercase tracking-widest text-brand-cream"
              >
                Or order on WhatsApp
              </a>
              <p className="mt-3 text-center text-[11px] opacity-70">
                COD only for now — online payments coming soon.
              </p>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
