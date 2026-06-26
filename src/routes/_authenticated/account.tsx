import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LogOut, User, MapPin, ShoppingBag, Heart } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, updateMyProfile, listMyAddresses, addAddress, deleteAddress } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — Healthy Delights" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const updateProfile = useServerFn(updateMyProfile);
  const listAddr = useServerFn(listMyAddresses);
  const addAddr = useServerFn(addAddress);
  const delAddr = useServerFn(deleteAddress);

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const addrQ = useQuery({ queryKey: ["addresses"], queryFn: () => listAddr() });

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  useEffect(() => {
    if (profileQ.data?.profile) {
      setName(profileQ.data.profile.full_name ?? "");
      setMobile(profileQ.data.profile.mobile ?? "");
    }
  }, [profileQ.data]);

  const saveProfile = useMutation({
    mutationFn: (v: { full_name: string; mobile: string }) => updateProfile({ data: v }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [addrForm, setAddrForm] = useState({
    full_name: "",
    mobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });
  const saveAddr = useMutation({
    mutationFn: (v: typeof addrForm) => addAddr({ data: v }),
    onSuccess: () => {
      toast.success("Address saved");
      setAddrForm({ full_name: "", mobile: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false });
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeAddr = useMutation({
    mutationFn: (id: string) => delAddr({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-brand-brown">My Account</h1>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full bg-brand-beige/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-brown"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>

        <nav className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NavTile to="/account" icon={User} label="Profile" active />
          <NavTile to="/orders" icon={ShoppingBag} label="Orders" />
          <NavTile to="/wishlist" icon={Heart} label="Wishlist" />
          {profileQ.data?.isAdmin && <NavTile to="/admin" icon={MapPin} label="Admin" />}
        </nav>

        <div className="rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10">
          <h2 className="mb-4 font-serif text-lg font-bold text-brand-brown">Profile</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile.mutate({ full_name: name, mobile });
            }}
            className="space-y-3"
          >
            <Field label="Full name" value={name} onChange={setName} />
            <Field label="Mobile" value={mobile} onChange={setMobile} type="tel" />
            <button
              type="submit"
              disabled={saveProfile.isPending}
              className="rounded-full bg-brand-brown px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-cream"
            >
              {saveProfile.isPending ? "Saving…" : "Save"}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10">
          <h2 className="mb-4 font-serif text-lg font-bold text-brand-brown">Saved addresses</h2>
          {(addrQ.data ?? []).length === 0 && (
            <p className="mb-4 text-sm text-brand-brown/60">No addresses saved yet.</p>
          )}
          <ul className="mb-6 space-y-2">
            {(addrQ.data ?? []).map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 rounded-2xl bg-brand-beige/40 p-4 text-sm">
                <div>
                  <div className="font-bold text-brand-brown">{a.full_name} · {a.mobile}</div>
                  <div className="text-brand-brown/70">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </div>
                  {a.is_default && <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-widest text-brand-gold">Default</span>}
                </div>
                <button
                  onClick={() => removeAddr.mutate(a.id)}
                  className="text-xs text-brand-brown/60 hover:text-brand-brown"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <details className="rounded-2xl bg-brand-beige/30 p-4">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-brand-brown">+ Add new address</summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveAddr.mutate(addrForm);
              }}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <Field label="Full name" value={addrForm.full_name} onChange={(v) => setAddrForm({ ...addrForm, full_name: v })} required />
              <Field label="Mobile" value={addrForm.mobile} onChange={(v) => setAddrForm({ ...addrForm, mobile: v })} required />
              <div className="sm:col-span-2"><Field label="Address line 1" value={addrForm.line1} onChange={(v) => setAddrForm({ ...addrForm, line1: v })} required /></div>
              <div className="sm:col-span-2"><Field label="Address line 2 (optional)" value={addrForm.line2} onChange={(v) => setAddrForm({ ...addrForm, line2: v })} /></div>
              <Field label="City" value={addrForm.city} onChange={(v) => setAddrForm({ ...addrForm, city: v })} required />
              <Field label="State" value={addrForm.state} onChange={(v) => setAddrForm({ ...addrForm, state: v })} required />
              <Field label="Pincode" value={addrForm.pincode} onChange={(v) => setAddrForm({ ...addrForm, pincode: v })} required />
              <label className="flex items-center gap-2 text-sm text-brand-brown/70">
                <input type="checkbox" checked={addrForm.is_default} onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })} />
                Make default
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={saveAddr.isPending} className="rounded-full bg-brand-brown px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-cream">
                  {saveAddr.isPending ? "Saving…" : "Save address"}
                </button>
              </div>
            </form>
          </details>
        </div>
      </section>
    </AppShell>
  );
}

function NavTile({ to, icon: Icon, label, active }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; active?: boolean }) {
  return (
    <Link
      to={to as "/"}
      className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-xs font-bold uppercase tracking-widest ring-1 ${active ? "bg-brand-brown text-brand-cream ring-brand-brown" : "bg-brand-cream text-brand-brown ring-brand-brown/10"}`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-widest text-brand-brown/70">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border-none bg-brand-beige/40 px-4 py-3 text-sm text-brand-brown outline-none ring-1 ring-transparent focus:ring-brand-gold"
      />
    </label>
  );
}
