import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [{ title: "Admin · Orders" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListOrders);
  const updFn = useServerFn(adminUpdateOrderStatus);
  const q = useQuery({ queryKey: ["admin-orders"], queryFn: () => listFn() });

  const update = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => updFn({ data: v }),
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  return (
    <AdminShell title="Orders">
      <div className="space-y-3">
        {(q.data ?? []).map((o) => (
          <div key={o.id} className="rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-serif font-bold text-brand-brown">{o.order_number}</div>
                <div className="text-xs text-brand-brown/60">{new Date(o.created_at).toLocaleString("en-IN")}</div>
                <div className="mt-1 text-sm">{o.ship_full_name} · {o.ship_mobile} · {o.ship_city}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-brand-brown">{formatINR(Number(o.total_inr))}</div>
                <select
                  value={o.status}
                  onChange={(e) => update.mutate({ id: o.id, status: e.target.value as (typeof STATUSES)[number] })}
                  className="mt-1 rounded-full bg-brand-beige/60 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-brown"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-brand-brown/70">Items ({(o.order_items ?? []).length})</summary>
              <ul className="mt-2 space-y-1">
                {(o.order_items ?? []).map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.quantity} × {it.product_name} ({it.weight_grams}g)</span>
                    <span>{formatINR(Number(it.line_total_inr))}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
