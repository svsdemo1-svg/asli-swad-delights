import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Package, ShoppingBag, Gift, FileText, Tag, Inbox, LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth-hooks";
import { checkAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

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
  const { user } = useAuth();
  const checkFn = useServerFn(checkAdmin);
  const adminQ = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkFn(),
    enabled: Boolean(user),
  });
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    "Admin";
  const roleLabel = adminQ.data?.isSuperAdmin
    ? "Super Admin"
    : adminQ.data?.isAdmin
      ? "Admin"
      : "Signed in";

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif text-2xl font-bold text-brand-brown">{title}</h1>
          {user && (
            <div className="flex items-center gap-3 rounded-full bg-brand-cream px-4 py-2 ring-1 ring-brand-brown/10">
              <ShieldCheck className="size-4 text-brand-green" />
              <div className="text-right leading-tight">
                <div className="text-xs font-bold text-brand-brown">{displayName}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">
                  {roleLabel}
                </div>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/auth";
                }}
                aria-label="Sign out"
                className="ml-1 grid size-8 place-items-center rounded-full bg-brand-brown/10 text-brand-brown hover:bg-brand-brown/20"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
        </div>
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
