import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListPosts, adminUpsertPost, adminDeletePost } from "@/lib/admin.functions";
import { getProductImage } from "@/lib/product-images";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_markdown: string;
  cover_image_key: string;
  author: string;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
};

const empty = { slug: "", title: "", excerpt: "", body_markdown: "", cover_image_key: "product-gond", author: "Menka Singh", seo_title: "", seo_description: "", is_published: true };

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({ meta: [{ title: "Admin · Blog" }, { name: "robots", content: "noindex" }] }),
  component: AdminBlogPage,
});

function AdminBlogPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListPosts);
  const upFn = useServerFn(adminUpsertPost);
  const delFn = useServerFn(adminDeletePost);

  const q = useQuery({ queryKey: ["admin-posts"], queryFn: () => listFn() });
  const [edit, setEdit] = useState<typeof empty & { id?: string }>(empty);

  const save = useMutation({
    mutationFn: () => upFn({ data: { ...edit, seo_title: edit.seo_title || null, seo_description: edit.seo_description || null } }),
    onSuccess: () => {
      toast.success("Saved");
      setEdit(empty);
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  return (
    <AdminShell title="Blog posts">
      <div className="mb-6 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
        <h3 className="mb-3 font-serif text-base font-bold text-brand-brown">{edit.id ? "Edit post" : "New post"}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Title" value={edit.title} onChange={(v) => setEdit({ ...edit, title: v })} />
          <F label="Slug" value={edit.slug} onChange={(v) => setEdit({ ...edit, slug: v.replace(/[^a-z0-9-]/g, "-").toLowerCase() })} />
          <F label="Author" value={edit.author} onChange={(v) => setEdit({ ...edit, author: v })} />
          <F label="Cover image key / URL" value={edit.cover_image_key} onChange={(v) => setEdit({ ...edit, cover_image_key: v })} />
          <div className="sm:col-span-2"><F label="Excerpt" value={edit.excerpt} onChange={(v) => setEdit({ ...edit, excerpt: v })} textarea /></div>
          <div className="sm:col-span-2"><F label="Body (markdown)" value={edit.body_markdown} onChange={(v) => setEdit({ ...edit, body_markdown: v })} textarea large /></div>
          <F label="SEO title" value={edit.seo_title} onChange={(v) => setEdit({ ...edit, seo_title: v })} />
          <F label="SEO description" value={edit.seo_description} onChange={(v) => setEdit({ ...edit, seo_description: v })} />
          <label className="flex items-center gap-2 text-xs text-brand-brown">
            <input type="checkbox" checked={edit.is_published} onChange={(e) => setEdit({ ...edit, is_published: e.target.checked })} />
            Published
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => save.mutate()} disabled={save.isPending} className="rounded-full bg-brand-brown px-6 py-2 text-xs font-bold uppercase tracking-widest text-brand-cream">
            {save.isPending ? "Saving…" : edit.id ? "Update" : "Create"}
          </button>
          {edit.id && <button onClick={() => setEdit(empty)} className="rounded-full bg-brand-beige/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-brown">Cancel</button>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(q.data ?? []).map((p: Post) => (
          <div key={p.id} className="flex gap-3 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
            <img src={getProductImage(p.cover_image_key)} alt="" className="size-20 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="font-serif font-bold text-brand-brown">{p.title}</div>
              <div className="text-xs text-brand-brown/60">{p.author} {p.is_published ? "" : "· Draft"}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setEdit({ ...p, seo_title: p.seo_title ?? "", seo_description: p.seo_description ?? "" })} className="text-xs font-bold uppercase tracking-widest text-brand-gold">Edit</button>
                <button onClick={() => del.mutate(p.id)} className="text-brand-brown/60 hover:text-brand-brown"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

function F({ label, value, onChange, type = "text", textarea, large }: { label: string; value: string; onChange: (v: string) => void; type?: string; textarea?: boolean; large?: boolean }) {
  const cls = "mt-1 w-full rounded-xl bg-brand-beige/40 px-3 py-2 text-sm outline-none";
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} ${large ? "h-72" : "h-24"} resize-y font-mono`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}
