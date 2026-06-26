import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, Gift, FileText, Tag, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/hampers", label: "Hampers", icon: Gift },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/inquiries", label: "Inquiries", icon: Inbox },
] as const;

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-5 font-serif text-2xl font-bold text-brand-brown">{title}</h1>
        <nav className="mb-6 flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-1.5 rounded-full bg-brand-cream px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-brown ring-1 ring-brand-brown/10"
              activeProps={{ className: "bg-brand-brown text-brand-cream ring-brand-brown" }}
              activeOptions={{ exact: l.to === "/admin" }}
            >
              <l.icon className="size-3.5" />
              {l.label}
            </Link>
          ))}
        </nav>
        {children}
      </section>
    </AppShell>
  );
}
