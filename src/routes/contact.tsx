import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";
import { sendContactMessage } from "@/lib/catalog.functions";

const PHONE = "919035066446";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Healthy Delights — Menka Singh" },
      {
        name: "description",
        content: "Get in touch with Menka Singh and the Healthy Delights team. WhatsApp, phone, email or contact form — we reply within 24 hours.",
      },
      { property: "og:title", content: "Contact — Healthy Delights" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const send = useServerFn(sendContactMessage);
  const mutation = useMutation({
    mutationFn: (vars: typeof form) =>
      send({ data: { ...vars, mobile: vars.mobile || undefined } }),
    onSuccess: () => {
      toast.success("Message received — we'll be in touch soon.");
      setForm({ name: "", email: "", mobile: "", message: "" });
    },
    onError: (e: Error) => toast.error(e.message || "Could not send message"),
  });

  return (
    <AppShell>
      <section className="px-6 pt-12 pb-6">
        <SectionHeading
          eyebrow="Say Hello"
          title="We'd love to hear from you"
          subtitle="Order help, wholesale, gifting or just a kind word — Menka and the team read every message."
        />
      </section>

      <section className="px-6 pb-14">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <InfoRow icon={Phone} label="Phone" value="+91 90350 66446" href={`tel:+${PHONE}`} />
            <InfoRow
              icon={MessageCircle}
              label="WhatsApp"
              value="Chat with us instantly"
              href={`https://wa.me/${PHONE}`}
            />
            <InfoRow
              icon={Mail}
              label="Email"
              value="info@healthydelights.in"
              href="mailto:info@healthydelights.in"
            />
            <InfoRow
              icon={MapPin}
              label="Owner"
              value="Menka Singh — Healthy Delights"
            />

            <div className="overflow-hidden rounded-3xl ring-1 ring-brand-brown/10">
              <iframe
                title="Healthy Delights location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.4%2C12.85%2C77.75%2C13.1&layer=mapnik"
                className="h-56 w-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          <form
            className="rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate(form);
            }}
          >
            <h3 className="mb-5 font-serif text-xl font-bold text-brand-brown">Send a message</h3>
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <Field
              label="Mobile"
              type="tel"
              value={form.mobile}
              onChange={(v) => setForm({ ...form, mobile: v })}
            />
            <Field
              label="Message"
              value={form.message}
              onChange={(v) => setForm({ ...form, message: v })}
              textarea
              required
            />
            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 w-full rounded-full bg-brand-brown py-3.5 text-xs font-bold uppercase tracking-widest text-brand-cream disabled:opacity-60"
            >
              {mutation.isPending ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const Wrapper: React.ElementType = href ? "a" : "div";
  return (
    <Wrapper
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-center gap-4 rounded-2xl bg-brand-cream p-4 ring-1 ring-brand-brown/5"
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-gold/10 text-brand-gold">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-brown/60">
          {label}
        </div>
        <div className="text-sm font-medium text-brand-brown">{value}</div>
      </div>
    </Wrapper>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const className =
    "mt-1 w-full rounded-2xl border-none bg-brand-beige/40 px-4 py-3 text-sm text-brand-brown outline-none ring-1 ring-transparent focus:ring-brand-gold";
  return (
    <label className="mb-4 block">
      <span className="text-[11px] font-bold uppercase tracking-widest text-brand-brown/70">
        {label}
        {required && " *"}
      </span>
      {textarea ? (
        <textarea
          className={`${className} h-28 resize-none`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          maxLength={2000}
        />
      ) : (
        <input
          type={type}
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      )}
    </label>
  );
}
