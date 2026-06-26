import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminDashboard, checkAdmin, claimFirstAdmin } from "@/lib/admin.functions";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin · Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const checkFn = useServerFn(checkAdmin);
  const claimFn = useServerFn(claimFirstAdmin);
  const dashFn = useServerFn(adminDashboard);

  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => checkFn() });

  useEffect(() => {
    if (adminQ.data && !adminQ.data.isAdmin) {
      // not yet admin – do nothing here; offer claim button below
    }
  }, [adminQ.data, navigate]);

  const claim = useMutation({
    mutationFn: () => claimFn(),
    onSuccess: (res) => {
      if (res.ok) {
        toast.success("You are now the admin!");
        window.location.reload();
      } else {
        toast.error(res.message ?? "Could not claim admin");
      }
    },
  });

  const dashQ = useQuery({
    queryKey: ["admin-dash"],
    queryFn: () => dashFn(),
    enabled: adminQ.data?.isAdmin === true,
  });

  if (adminQ.isLoading) return <AdminShell title="Admin"><p>Checking access…</p></AdminShell>;

  if (!adminQ.data?.isAdmin) {
    return (
      <AdminShell title="Admin access">
        <div className="rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10">
          <p className="mb-4 text-sm text-brand-brown/70">
            You don't yet have admin access. If you are the first user (Menka), claim it now.
            After that, an existing admin must grant access to other users from the database.
          </p>
          <button
            onClick={() => claim.mutate()}
            disabled={claim.isPending}
            className="rounded-full bg-brand-brown px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-cream"
          >
            {claim.isPending ? "Claiming…" : "Claim first admin"}
          </button>
        </div>
      </AdminShell>
    );
  }

  const d = dashQ.data;

  return (
    <AdminShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Orders (total)" value={d?.orderCount ?? "—"} />
        <Stat label="Pending orders" value={d?.pendingOrders ?? "—"} />
        <Stat label="Revenue today" value={d ? formatINR(d.revenueToday) : "—"} />
        <Stat label="Revenue (30d)" value={d ? formatINR(d.revenueMonth) : "—"} />
        <Stat label="Products" value={d?.productCount ?? "—"} />
        <Stat label="Subscribers" value={d?.subscriberCount ?? "—"} />
        <Stat label="Contact msgs" value={d?.contactCount ?? "—"} />
        <Stat label="Corporate inq." value={d?.inquiryCount ?? "—"} />
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/10">
      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">{label}</div>
      <div className="mt-1 font-serif text-2xl font-bold text-brand-brown">{value}</div>
    </div>
  );
}
