import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getMyOrder } from "@/lib/orders.functions";
import { formatINR } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order details — Healthy Delights" }, { name: "robots", content: "noindex" }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const getFn = useServerFn(getMyOrder);
  const q = useQuery({ queryKey: ["order", id], queryFn: () => getFn({ data: { id } }) });
  if (q.isLoading) return <AppShell><div className="px-5 py-10 text-center text-brand-brown/60">Loading…</div></AppShell>;
  if (!q.data) throw notFound();
  const o = q.data;

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-5 py-10 print:py-2">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link to="/orders" className="text-xs font-bold uppercase tracking-widest text-brand-brown/60">← All orders</Link>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-brand-beige/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-brown">
            <Printer className="size-3.5" /> Invoice
          </button>
        </div>

        <div className="rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10 print:rounded-none print:p-0 print:ring-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-serif text-2xl font-bold text-brand-brown">{o.order_number}</div>
              <div className="text-xs text-brand-brown/60">Placed on {new Date(o.created_at).toLocaleString("en-IN")}</div>
            </div>
            <span className="rounded-full bg-brand-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
              {o.status}
            </span>
          </div>

          <div className="mb-5 rounded-2xl bg-brand-beige/40 p-4 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">Shipping to</div>
            <div className="font-bold text-brand-brown">{o.ship_full_name} · {o.ship_mobile}</div>
            <div className="text-brand-brown/70">{o.ship_line1}{o.ship_line2 ? `, ${o.ship_line2}` : ""}, {o.ship_city}, {o.ship_state} {o.ship_pincode}</div>
          </div>

          <ul className="mb-4 divide-y divide-brand-brown/10">
            {(o.order_items ?? []).map((it) => (
              <li key={it.id} className="flex gap-3 py-3 text-sm">
                <img src={getProductImage(it.image_key)} alt="" className="size-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-bold text-brand-brown">{it.product_name}</div>
                  <div className="text-xs text-brand-brown/60">{it.weight_grams}g · {it.quantity} × {formatINR(Number(it.unit_price_inr))}</div>
                </div>
                <div className="font-bold text-brand-brown">{formatINR(Number(it.line_total_inr))}</div>
              </li>
            ))}
          </ul>

          <div className="space-y-1 text-sm">
            <Row label="Subtotal" value={formatINR(Number(o.subtotal_inr))} />
            {Number(o.discount_inr) > 0 && <Row label={`Discount (${o.coupon_code})`} value={`−${formatINR(Number(o.discount_inr))}`} />}
            <Row label="Shipping" value={formatINR(Number(o.shipping_inr))} />
            <div className="my-2 h-px bg-brand-brown/10" />
            <Row label="Total" value={formatINR(Number(o.total_inr))} bold />
            <Row label="Payment" value="Cash on Delivery" />
          </div>

          {o.notes && (
            <div className="mt-4 rounded-2xl bg-brand-beige/40 p-3 text-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">Notes</div>
              {o.notes}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-serif text-lg font-bold text-brand-brown" : "text-brand-brown/70"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
