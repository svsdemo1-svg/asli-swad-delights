import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-hooks";

const nav = [
  { to: "/" as const, label: "Home" },
  { to: "/products" as const, label: "Shop" },
  { to: "/festive-gifting" as const, label: "Gifting" },
  { to: "/blog" as const, label: "Blog" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = useCart((s) => s.totalItems());
  const { user } = useAuth();


  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-brand-brown/5 bg-brand-cream/90 px-5 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button aria-label="Open menu" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu className="size-5 text-brand-brown" />
        </button>
        <Link to="/" className="font-serif text-xl font-bold tracking-tight text-brand-brown">
          Healthy Delights
        </Link>
      </div>

      <ul className="hidden items-center gap-8 md:flex">
        {nav.map((n) => (
          <li key={n.to}>
            <Link
              to={n.to}
              className="text-sm font-medium text-brand-brown/80 transition-colors hover:text-brand-gold"
              activeProps={{ className: "text-brand-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <Link
          to={user ? "/account" : "/auth"}
          className="text-brand-brown"
          aria-label={user ? "My account" : "Sign in"}
        >
          <User className="size-5" />
        </Link>
        <Link to="/cart" className="relative" aria-label="View cart">
          <ShoppingBag className="size-5 text-brand-brown" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-cream">
              {count}
            </span>
          )}
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-brand-brown/40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="ml-auto h-full w-[78%] max-w-xs bg-brand-cream px-6 py-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-serif text-lg font-bold">Menu</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <ul className="space-y-5">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="block font-serif text-2xl text-brand-brown"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={user ? "/account" : "/auth"} onClick={() => setOpen(false)} className="block font-serif text-2xl text-brand-brown">
                  {user ? "My Account" : "Sign in"}
                </Link>
              </li>
              {user && (
                <>
                  <li><Link to="/orders" onClick={() => setOpen(false)} className="block font-serif text-2xl text-brand-brown">My Orders</Link></li>
                  <li><Link to="/wishlist" onClick={() => setOpen(false)} className="block font-serif text-2xl text-brand-brown">Wishlist</Link></li>
                </>
              )}
              <li>
                <Link to="/corporate-gifting" onClick={() => setOpen(false)} className="block text-sm font-medium uppercase tracking-widest text-brand-gold">
                  Corporate Gifting
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
