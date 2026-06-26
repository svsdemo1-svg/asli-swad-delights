import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { getProductImage } from "@/lib/product-images";
import { listMyAddresses } from "@/lib/account.functions";
import { validateCoupon, placeOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Healthy Delights" }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.totalAmount());
  const clearCart = useCart((s) => s.clearCart);

  const listAddr = useServerFn(listMyAddresses);
  const addrQ = useQuery({ queryKey: ["addresses"], queryFn: () => listAddr() });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    full_name: "",
    mobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const validateFn = useServerFn(validateCoupon);
  const placeFn = useServerFn(placeOrder);

  const applyCoupon = useMutation({
    mutationFn: () => validateFn({ data: { code: coupon, subtotal } }),
    onSuccess: (res) => {
      if (res.valid) {
        setDiscount(res.discount);
        setAppliedCode(res.code);
        toast.success(`Coupon applied: −${formatINR(res.discount)}`);
      } else {
        setDiscount(0);
        setAppliedCode(null);
        toast.error(res.message);
      }
    },
  });

  const shipping = subtotal >= 999 ? 0 : 49;
  const total = Math.max(0, subtotal - discount + shipping);

  const submit = useMutation({
    mutationFn: async () => {
      const addr = selectedId ? (addrQ.data ?? []).find((a) => a.id === selectedId) : null;
      const shipAddr = addr
        ? {
            full_name: addr.full_name,
            mobile: addr.mobile,
            line1: addr.line1,
            line2: addr.line2 ?? "",
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
          }
        : newAddr;
      return placeFn({
        data: {
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            imageKey: i.imageKey,
            weightGrams: i.weightGrams,
            price: i.price,
            qty: i.qty,
            kind: i.kind ?? "product",
          })),
          address: shipAddr,
          coupon_code: appliedCode ?? "",
          notes,
        },
      });
    },
    onSuccess: (res) => {
      clearCart();
      toast.success(`Order ${res.order_number} placed!`);
      navigate({ to: "/orders/$id", params: { id: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (items.length === 0) {
    return (
      <AppShell>
        <section className="mx-auto max-w-md px-5 py-16 text-center">
          <p className="mb-4 font-serif text-xl text-brand-brown">Your bag is empty.</p>
          <Link to="/products" className="inline-block rounded-full bg-brand-brown px-6 py-3 text-xs font-bold uppercase tracking-widest text-brand-cream">
            Browse the pantry
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="mb-8 font-serif text-3xl font-bold text-brand-brown">Checkout</h1>

        <div className="rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10">
          <h2 className="mb-4 font-serif text-lg font-bold text-brand-brown">Delivery address</h2>
          {(addrQ.data ?? []).length > 0 && (
            <ul className="mb-4 space-y-2">
              {(addrQ.data ?? []).map((a) => (
                <li key={a.id}>
                  <label className={`flex cursor-pointer gap-3 rounded-2xl p-3 ring-1 ${selectedId === a.id ? "bg-brand-gold/10 ring-brand-gold" : "bg-brand-beige/30 ring-transparent"}`}>
                    <input type="radio" name="addr" checked={selectedId === a.id} onChange={() => setSelectedId(a.id)} className="mt-1" />
                    <div className="text-sm">
                      <div className="font-bold text-brand-brown">{a.full_name} · {a.mobile}</div>
                      <div className="text-brand-brown/70">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}</div>
                    </div>
                  </label>
                </li>
              ))}
              <li>
                <label className={`flex cursor-pointer items-center gap-3 rounded-2xl p-3 text-sm ring-1 ${selectedId === null ? "bg-brand-gold/10 ring-brand-gold" : "bg-brand-beige/30 ring-transparent"}`}>
                  <input type="radio" name="addr" checked={selectedId === null} onChange={() => setSelectedId(null)} />
                  Use a new address
                </label>
              </li>
            </ul>
          )}
          {selectedId === null && (
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Full name" value={newAddr.full_name} onChange={(v) => setNewAddr({ ...newAddr, full_name: v })} />
              <F label="Mobile" value={newAddr.mobile} onChange={(v) => setNewAddr({ ...newAddr, mobile: v })} />
              <div className="sm:col-span-2"><F label="Address line 1" value={newAddr.line1} onChange={(v) => setNewAddr({ ...newAddr, line1: v })} /></div>
              <div className="sm:col-span-2"><F label="Address line 2" value={newAddr.line2} onChange={(v) => setNewAddr({ ...newAddr, line2: v })} /></div>
              <F label="City" value={newAddr.city} onChange={(v) => setNewAddr({ ...newAddr, city: v })} />
              <F label="State" value={newAddr.state} onChange={(v) => setNewAddr({ ...newAddr, state: v })} />
              <F label="Pincode" value={newAddr.pincode} onChange={(v) => setNewAddr({ ...newAddr, pincode: v })} />
            </div>
          )}
        </div>

        <div className="mt-5 rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10">
          <h2 className="mb-3 font-serif text-lg font-bold text-brand-brown">Coupon</h2>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
              className="flex-1 rounded-2xl bg-brand-beige/40 px-4 py-3 text-sm uppercase tracking-widest text-brand-brown outline-none"
            />
            <button
              onClick={() => applyCoupon.mutate()}
              disabled={!coupon || applyCoupon.isPending}
              className="rounded-full bg-brand-brown px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-cream"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10">
          <h2 className="mb-3 font-serif text-lg font-bold text-brand-brown">Items</h2>
          <ul className="mb-4 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-3 text-sm">
                <img src={getProductImage(i.imageKey)} alt="" className="size-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-bold text-brand-brown">{i.name}</div>
                  <div className="text-xs text-brand-brown/60">{i.qty} × {formatINR(i.price)}</div>
                </div>
                <div className="font-bold text-brand-brown">{formatINR(i.price * i.qty)}</div>
              </li>
            ))}
          </ul>
          <textarea
            placeholder="Order notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            className="w-full rounded-2xl bg-brand-beige/40 px-4 py-3 text-sm text-brand-brown outline-none"
            rows={2}
          />
        </div>

        <div className="mt-5 rounded-3xl bg-brand-brown p-6 text-brand-cream">
          <Row label="Subtotal" value={formatINR(subtotal)} />
          {discount > 0 && <Row label={`Discount (${appliedCode})`} value={`−${formatINR(discount)}`} />}
          <Row label={`Shipping${shipping === 0 ? " (free)" : ""}`} value={formatINR(shipping)} />
          <div className="my-3 h-px bg-brand-cream/15" />
          <Row label="Total" value={formatINR(total)} bold />
          <p className="mt-3 text-[11px] opacity-70">Payment method: Cash on Delivery. Online payments coming soon.</p>
          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending}
            className="mt-5 block w-full rounded-full bg-brand-gold py-4 text-center text-xs font-bold uppercase tracking-widest text-brand-cream disabled:opacity-60"
          >
            {submit.isPending ? "Placing order…" : "Place Order"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "font-serif text-lg" : "opacity-90"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-widest text-brand-brown/70">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl bg-brand-beige/40 px-4 py-3 text-sm text-brand-brown outline-none" />
    </label>
  );
}
