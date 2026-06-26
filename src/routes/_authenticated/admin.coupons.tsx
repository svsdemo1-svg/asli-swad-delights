import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListCoupons, adminUpsertCoupon, adminDeleteCoupon } from "@/lib/admin.functions";

const empty = { code: "", discount_type: "percent" as "percent" | "flat", value: 10, min_order_inr: 0, is_active: true };

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  head: () => ({ meta: [{ title: "Admin · Coupons" }, { name: "robots", content: "noindex" }] }),
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListCoupons);
  const upFn = useServerFn(adminUpsertCoupon);
  const delFn = useServerFn(adminDeleteCoupon);

  const q = useQuery({ queryKey: ["admin-coupons"], queryFn: () => listFn() });
  const [edit, setEdit] = useState<typeof empty & { id?: string }>(empty);

  const save = useMutation({
    mutationFn: () => upFn({ data: edit }),
    onSuccess: () => {
      toast.success("Saved");
      setEdit(empty);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });

  return (
    <AdminShell title="Coupons">
      <div className="mb-6 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
        <h3 className="mb-3 font-serif text-base font-bold text-brand-brown">{edit.id ? "Edit coupon" : "New coupon"}</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <F label="Code" value={edit.code} onChange={(v) => setEdit({ ...edit, code: v.toUpperCase() })} />
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">Type</span>
            <select value={edit.discount_type} onChange={(e) => setEdit({ ...edit, discount_type: e.target.value as "percent" | "flat" })} className="mt-1 w-full rounded-xl bg-brand-beige/40 px-3 py-2 text-sm outline-none">
              <option value="percent">Percent</option>
              <option value="flat">Flat ₹</option>
            </select>
          </label>
          <F label="Value" type="number" value={String(edit.value)} onChange={(v) => setEdit({ ...edit, value: Number(v) })} />
          <F label="Min order ₹" type="number" value={String(edit.min_order_inr)} onChange={(v) => setEdit({ ...edit, min_order_inr: Number(v) })} />
          <label className="flex items-center gap-2 text-xs text-brand-brown">
            <input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Active
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-brand-brown px-6 py-2 text-xs font-bold uppercase tracking-widest text-brand-cream">
            {save.isPending ? "Saving…" : edit.id ? "Update" : "Create"}
          </button>
          {edit.id && <button onClick={() => setEdit(empty)} className="rounded-full bg-brand-beige/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-brown">Cancel</button>}
        </div>
      </div>

      <table className="w-full rounded-2xl bg-brand-cream text-sm ring-1 ring-brand-brown/10">
        <thead className="text-left text-[10px] uppercase tracking-widest text-brand-brown/60">
          <tr><th className="px-4 py-3">Code</th><th>Type</th><th>Value</th><th>Min order</th><th>Active</th><th /></tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((c) => (
            <tr key={c.id} className="border-t border-brand-brown/10">
              <td className="px-4 py-3 font-bold">{c.code}</td>
              <td>{c.discount_type}</td>
              <td>{c.value}{c.discount_type === "percent" ? "%" : "₹"}</td>
              <td>₹{c.min_order_inr}</td>
              <td>{c.is_active ? "Yes" : "No"}</td>
              <td className="pr-4 text-right">
                <button onClick={() => setEdit({ id: c.id, code: c.code, discount_type: c.discount_type as "percent" | "flat", value: Number(c.value), min_order_inr: Number(c.min_order_inr), is_active: c.is_active })} className="mr-3 text-xs font-bold uppercase tracking-widest text-brand-gold">Edit</button>
                <button onClick={() => del.mutate(c.id)}><Trash2 className="size-3.5 text-brand-brown/60" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}

function F({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl bg-brand-beige/40 px-3 py-2 text-sm outline-none" />
    </label>
  );
}
