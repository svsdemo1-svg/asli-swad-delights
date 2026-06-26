import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { listMyOrders } from "@/lib/orders.functions";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({ meta: [{ title: "My orders — Healthy Delights" }, { name: "robots", content: "noindex" }] }),
  component: OrdersPage,
});

const statusColor: Record<string, string> = {
  pending: "bg-brand-gold/15 text-brand-gold",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-brand-green/15 text-brand-green",
  cancelled: "bg-red-100 text-red-700",
};

function OrdersPage() {
  const listFn = useServerFn(listMyOrders);
  const q = useQuery({ queryKey: ["my-orders"], queryFn: () => listFn() });
  const orders = q.data ?? [];

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-6 font-serif text-3xl font-bold text-brand-brown">My Orders</h1>
        {orders.length === 0 ? (
          <div className="rounded-3xl bg-brand-beige/40 p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 size-8 text-brand-brown/40" />
            <p className="mb-5 font-serif text-xl text-brand-brown">No orders yet.</p>
            <Link to="/products" className="inline-block rounded-full bg-brand-brown px-6 py-3 text-xs font-bold uppercase tracking-widest text-brand-cream">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between rounded-2xl bg-brand-cream p-5 ring-1 ring-brand-brown/5 hover:ring-brand-brown/20"
                >
                  <div>
                    <div className="font-serif text-base font-bold text-brand-brown">{o.order_number}</div>
                    <div className="text-xs text-brand-brown/60">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <span className={`mt-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusColor[o.status] ?? "bg-brand-beige/60 text-brand-brown"}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-brown">{formatINR(Number(o.total_inr))}</div>
                    <div className="text-xs text-brand-brown/60">COD</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
