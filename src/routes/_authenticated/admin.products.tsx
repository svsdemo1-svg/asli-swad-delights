import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminUpdateProduct } from "@/lib/admin.functions";
import { listProducts } from "@/lib/catalog.functions";
import { getProductImage } from "@/lib/product-images";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Admin · Products" }, { name: "robots", content: "noindex" }] }),
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listProducts);
  const q = useQuery({ queryKey: ["admin-products"], queryFn: () => listFn() });
  const products = q.data ?? [];

  return (
    <AdminShell title="Products">
      <p className="mb-4 text-sm text-brand-brown/70">
        Edit price, weight, image and visibility. Image accepts a bundled key (e.g. <code>product-gond</code>) or a full image URL.
      </p>
      <div className="space-y-3">
        {products.map((p) => (
          <Row key={p.id} product={p} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-products"] })} />
        ))}
      </div>
    </AdminShell>
  );
}

function Row({
  product,
  onSaved,
}: {
  product: { id: string; name: string; price_inr: number; weight_grams: number; image_key: string; in_stock: boolean; is_featured: boolean; is_best_seller: boolean };
  onSaved: () => void;
}) {
  const updateFn = useServerFn(adminUpdateProduct);
  const [price, setPrice] = useState(String(product.price_inr));
  const [weight, setWeight] = useState(String(product.weight_grams));
  const [image, setImage] = useState(product.image_key);
  const [inStock, setInStock] = useState(product.in_stock);
  const [featured, setFeatured] = useState(product.is_featured);
  const [bestSeller, setBestSeller] = useState(product.is_best_seller);

  const save = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          id: product.id,
          price_inr: Number(price),
          weight_grams: Number(weight),
          image_key: image,
          in_stock: inStock,
          is_featured: featured,
          is_best_seller: bestSeller,
        },
      }),
    onSuccess: () => {
      toast.success("Saved");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
      <div className="flex flex-col gap-4 sm:flex-row">
        <img src={getProductImage(image)} alt={product.name} className="size-24 shrink-0 rounded-xl object-cover" />
        <div className="flex-1 space-y-2">
          <div className="font-serif text-base font-bold text-brand-brown">{product.name}</div>
          <div className="text-xs text-brand-brown/60">Current: {formatINR(product.price_inr)} · {product.weight_grams}g</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Mini label="Price (₹)" value={price} onChange={setPrice} type="number" />
            <Mini label="Weight (g)" value={weight} onChange={setWeight} type="number" />
            <Mini label="Image key / URL" value={image} onChange={setImage} />
          </div>
          <div className="flex flex-wrap gap-3 pt-1 text-xs text-brand-brown">
            <Check label="In stock" checked={inStock} onChange={setInStock} />
            <Check label="Featured" checked={featured} onChange={setFeatured} />
            <Check label="Best seller" checked={bestSeller} onChange={setBestSeller} />
          </div>
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="self-start rounded-full bg-brand-brown px-5 py-2 text-xs font-bold uppercase tracking-widest text-brand-cream"
        >
          {save.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Mini({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 w-full rounded-xl bg-brand-beige/40 px-3 py-2 text-sm outline-none" />
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
