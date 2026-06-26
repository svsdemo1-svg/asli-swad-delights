import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListHampers, adminUpsertHamper, adminDeleteHamper } from "@/lib/admin.functions";
import { getProductImage } from "@/lib/product-images";
import { formatINR } from "@/lib/format";

type Hamper = {
  id: string;
  slug: string;
  name: string;
  description: string;
  occasion: string;
  price_inr: number;
  image_key: string;
  contents: string[];
  is_published: boolean;
  sort_order: number;
};

const emptyHamper = { slug: "", name: "", description: "", occasion: "festive", price_inr: 0, image_key: "product-dry-fruit", contents: [] as string[], is_published: true, sort_order: 0 };

export const Route = createFileRoute("/_authenticated/admin/hampers")({
  head: () => ({ meta: [{ title: "Admin · Hampers" }, { name: "robots", content: "noindex" }] }),
  component: AdminHampersPage,
});

function AdminHampersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListHampers);
  const upsertFn = useServerFn(adminUpsertHamper);
  const delFn = useServerFn(adminDeleteHamper);

  const q = useQuery({ queryKey: ["admin-hampers"], queryFn: () => listFn() });
  const [edit, setEdit] = useState<typeof emptyHamper & { id?: string }>(emptyHamper);

  const save = useMutation({
    mutationFn: () => upsertFn({ data: edit }),
    onSuccess: () => {
      toast.success("Saved");
      setEdit(emptyHamper);
      qc.invalidateQueries({ queryKey: ["admin-hampers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-hampers"] }),
  });

  return (
    <AdminShell title="Gift hampers">
      <div className="mb-6 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
        <h3 className="mb-3 font-serif text-base font-bold text-brand-brown">{edit.id ? "Edit hamper" : "New hamper"}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
          <F label="Slug" value={edit.slug} onChange={(v) => setEdit({ ...edit, slug: v.replace(/[^a-z0-9-]/g, "-").toLowerCase() })} />
          <F label="Occasion" value={edit.occasion} onChange={(v) => setEdit({ ...edit, occasion: v })} />
          <F label="Price ₹" type="number" value={String(edit.price_inr)} onChange={(v) => setEdit({ ...edit, price_inr: Number(v) })} />
          <F label="Image key / URL" value={edit.image_key} onChange={(v) => setEdit({ ...edit, image_key: v })} />
          <F label="Sort order" type="number" value={String(edit.sort_order)} onChange={(v) => setEdit({ ...edit, sort_order: Number(v) })} />
          <div className="sm:col-span-2">
            <F label="Description" value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} textarea />
          </div>
          <div className="sm:col-span-2">
            <F
              label="Contents (one per line)"
              value={edit.contents.join("\n")}
              onChange={(v) => setEdit({ ...edit, contents: v.split("\n").map((s) => s.trim()).filter(Boolean) })}
              textarea
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-brand-brown">
            <input type="checkbox" checked={edit.is_published} onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })} />
            Published
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-brand-brown px-6 py-2 text-xs font-bold uppercase tracking-widest text-brand-cream">
            {save.isPending ? "Saving…" : edit.id ? "Update" : "Create"}
          </button>
          {edit.id && (
            <button onClick={() => setEdit(emptyHamper)} className="rounded-full bg-brand-beige/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-brown">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(q.data ?? []).map((raw) => {
          const h = { ...raw, contents: Array.isArray(raw.contents) ? (raw.contents as string[]) : [] } as Hamper;
          return (
          <div key={h.id} className="flex gap-3 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
            <img src={getProductImage(h.image_key)} alt="" className="size-20 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="font-serif font-bold text-brand-brown">{h.name}</div>
              <div className="text-xs text-brand-brown/60">{h.occasion} · {formatINR(Number(h.price_inr))}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setEdit({ ...h, contents: h.contents ?? [] })} className="text-xs font-bold uppercase tracking-widest text-brand-gold">Edit</button>
                <button onClick={() => del.mutate(h.id)} className="text-brand-brown/60 hover:text-brand-brown"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </AdminShell>
  );
}

function F({ label, value, onChange, type = "text", textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean }) {
  const cls = "mt-1 w-full rounded-xl bg-brand-beige/40 px-3 py-2 text-sm outline-none";
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} h-24 resize-none`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}
