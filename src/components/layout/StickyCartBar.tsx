import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";

export function StickyCartBar() {
  const count = useCart((s) => s.totalItems());
  const total = useCart((s) => s.totalAmount());
  // Cart state is hydrated from localStorage → guard SSR/client mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full p-4 animate-fade-in-up">
      <Link
        to="/cart"
        className="mx-auto flex max-w-md items-center justify-between rounded-full bg-brand-brown px-6 py-4 text-brand-cream shadow-2xl ring-1 ring-brand-brown/30"
      >
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-full bg-brand-gold text-xs font-bold">
            {count}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">
            {count === 1 ? "Item in basket" : "Items in basket"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium opacity-80">{formatINR(total)}</span>
          <div className="mx-1 h-4 w-px bg-brand-cream/30" />
          <span className="text-xs font-bold uppercase">Checkout →</span>
        </div>
      </Link>
    </div>
  );
}
