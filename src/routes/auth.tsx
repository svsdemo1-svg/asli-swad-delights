import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AppShell } from "@/components/layout/AppShell";
import { useServerFn } from "@tanstack/react-start";
import { mergeWishlist } from "@/lib/wishlist.functions";
import { useCart } from "@/lib/cart-store";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — Healthy Delights" },
      { name: "description", content: "Sign in or create your Healthy Delights account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const wishlist = useCart((s) => s.wishlist);
  const mergeFn = useServerFn(mergeWishlist);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  // If already signed in, bounce to redirect or home.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: (redirectTo as "/") ?? "/" });
    });
  }, [navigate, redirectTo]);

  const afterAuth = async () => {
    if (wishlist.length > 0) {
      try {
        await mergeFn({ data: { slugs: wishlist } });
      } catch {
        /* non-fatal */
      }
    }
    await router.invalidate();
    navigate({ to: (redirectTo as "/") ?? "/" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      await afterAuth();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const signInGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      if (result.redirected) return;
      await afterAuth();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <section className="mx-auto max-w-md px-5 py-12">
        <div className="rounded-3xl bg-brand-cream p-7 ring-1 ring-brand-brown/10">
          <h1 className="mb-1 font-serif text-2xl font-bold text-brand-brown">
            {mode === "signup" ? "Create account" : "Welcome back"}
          </h1>
          <p className="mb-6 text-sm text-brand-brown/60">
            {mode === "signup"
              ? "Join Healthy Delights to track orders & save your favourites."
              : "Sign in to view orders, addresses and your wishlist."}
          </p>

          <button
            onClick={signInGoogle}
            disabled={busy}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-brand-brown ring-1 ring-brand-brown/15 hover:bg-brand-beige/40 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-brown/40">
            <span className="h-px flex-1 bg-brand-brown/10" />
            or with email
            <span className="h-px flex-1 bg-brand-brown/10" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Input label="Full name" value={fullName} onChange={setFullName} required />
            )}
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-full bg-brand-brown py-3.5 text-xs font-bold uppercase tracking-widest text-brand-cream disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-brand-brown/70">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-semibold text-brand-gold hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create account"}
            </button>
          </p>
          <p className="mt-6 text-center text-xs text-brand-brown/50">
            <Link to="/" className="underline">
              Back to home
            </Link>
          </p>
        </div>
      </section>
    </AppShell>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-widest text-brand-brown/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="mt-1 w-full rounded-2xl border-none bg-brand-beige/40 px-4 py-3 text-sm text-brand-brown outline-none ring-1 ring-transparent focus:ring-brand-gold"
      />
    </label>
  );
}
