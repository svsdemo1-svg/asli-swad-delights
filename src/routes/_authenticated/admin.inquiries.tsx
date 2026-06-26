import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminListInquiries } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  head: () => ({ meta: [{ title: "Admin · Inquiries" }, { name: "robots", content: "noindex" }] }),
  component: AdminInquiriesPage,
});

function csvDownload(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function AdminInquiriesPage() {
  const fn = useServerFn(adminListInquiries);
  const q = useQuery({ queryKey: ["admin-inquiries"], queryFn: () => fn() });
  const d = q.data;

  return (
    <AdminShell title="Inquiries & subscribers">
      <Block
        title="Contact messages"
        items={d?.contacts ?? []}
        onExport={() => csvDownload("contact-messages.csv", d?.contacts ?? [])}
        render={(m) => (<>
          <div className="font-bold">{m.name} <span className="font-normal text-brand-brown/60">· {m.email} · {m.mobile ?? "—"}</span></div>
          <div className="mt-1 text-sm">{m.message}</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-brand-brown/40">{new Date(m.created_at).toLocaleString("en-IN")}</div>
        </>)}
      />
      <Block
        title="Corporate inquiries"
        items={d?.corporate ?? []}
        onExport={() => csvDownload("corporate-inquiries.csv", d?.corporate ?? [])}
        render={(m) => (<>
          <div className="font-bold">{m.name} · {m.company_name}</div>
          <div className="text-xs text-brand-brown/60">{m.email} · {m.mobile}</div>
          <div className="mt-1 text-sm">{m.requirement}</div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-brand-brown/40">{new Date(m.created_at).toLocaleString("en-IN")}</div>
        </>)}
      />
      <Block
        title="Newsletter subscribers"
        items={d?.subscribers ?? []}
        onExport={() => csvDownload("subscribers.csv", d?.subscribers ?? [])}
        render={(s) => (<div className="text-sm">{s.email} {s.name ? `· ${s.name}` : ""} <span className="text-[10px] uppercase tracking-widest text-brand-brown/40">{new Date(s.created_at).toLocaleDateString()}</span></div>)}
      />
    </AdminShell>
  );
}

function Block<T extends { id: string }>({ title, items, onExport, render }: { title: string; items: T[]; onExport: () => void; render: (item: T) => React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-brand-brown">{title} <span className="text-sm text-brand-brown/60">({items.length})</span></h2>
        <button onClick={onExport} className="rounded-full bg-brand-beige/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-brown">Export CSV</button>
      </div>
      <ul className="space-y-2">
        {items.map((m) => (
          <li key={m.id} className="rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">{render(m)}</li>
        ))}
        {items.length === 0 && <li className="text-sm text-brand-brown/50">None yet.</li>}
      </ul>
    </section>
  );
}
