import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/catalog.functions";

export function Newsletter() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const subscribe = useServerFn(subscribeNewsletter);
  const mutation = useMutation({
    mutationFn: (vars: { email: string; name?: string }) => subscribe({ data: vars }),
    onSuccess: () => {
      toast.success("Welcome to the circle. Check your inbox soon.");
      setName("");
      setEmail("");
    },
    onError: (e: Error) => toast.error(e.message || "Could not subscribe — please try again."),
  });

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-md rounded-[32px] bg-brand-green/10 p-8 text-center">
        <h3 className="mb-2 font-serif text-2xl font-bold text-brand-brown">Join the Circle</h3>
        <p className="mb-6 text-sm text-brand-brown/70">
          Get healthy updates, seasonal recipes & special offers.
        </p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email) return;
            mutation.mutate({ email, name: name || undefined });
          }}
        >
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="rounded-full border-none bg-white px-6 py-4 text-sm text-brand-brown outline-none ring-1 ring-brand-brown/5 transition-all focus:ring-brand-gold"
          />
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            className="rounded-full border-none bg-white px-6 py-4 text-sm text-brand-brown outline-none ring-1 ring-brand-brown/5 transition-all focus:ring-brand-gold"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-full bg-brand-brown py-4 text-xs font-bold uppercase tracking-widest text-brand-cream disabled:opacity-60"
          >
            {mutation.isPending ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
