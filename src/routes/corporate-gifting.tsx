import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Gift, Package, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";
import { sendCorporateInquiry } from "@/lib/catalog.functions";

const offerings = [
  { icon: Gift, title: "Employee Gifts", body: "Premium wellness hampers your team will love." },
  { icon: Sparkles, title: "Festive Hampers", body: "Diwali, New Year, anniversaries — celebrated with care." },
  { icon: Package, title: "Bulk Orders", body: "Volume pricing for events, conferences and retail." },
  { icon: Building2, title: "Custom Branding", body: "Co-branded packaging and personalised notes." },
];

export const Route = createFileRoute("/corporate-gifting")({
  head: () => ({
    meta: [
      { title: "Corporate Wellness Gifting — Healthy Delights" },
      {
        name: "description",
        content: "Premium corporate gifting hampers — handcrafted laddoos and traditional Indian snacks for employees, clients and festive occasions.",
      },
      { property: "og:title", content: "Corporate Gifting — Healthy Delights" },
      { property: "og:url", content: "/corporate-gifting" },
    ],
    links: [{ rel: "canonical", href: "/corporate-gifting" }],
  }),
  component: CorporatePage,
});

function CorporatePage() {
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    email: "",
    mobile: "",
    requirement: "",
  });
  const send = useServerFn(sendCorporateInquiry);
  const mutation = useMutation({
    mutationFn: (vars: typeof form) => send({ data: vars }),
    onSuccess: () => {
      toast.success("Inquiry received — our team will revert within 24 hours.");
      setForm({ name: "", company_name: "", email: "", mobile: "", requirement: "" });
    },
    onError: (e: Error) => toast.error(e.message || "Could not submit inquiry"),
  });

  return (
    <AppShell>
      <section className="bg-brand-brown px-6 py-16 text-brand-beige">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.25em] text-brand-gold-soft">
            For Companies
          </span>
          <h1 className="mb-4 font-serif text-3xl md:text-4xl text-brand-cream">
            Corporate Wellness Gifting
          </h1>
          <p className="text-sm text-brand-beige/80">
            Gift your team, clients and partners something they'll actually love — handcrafted,
            healthy, preservative-free Indian delicacies in premium packaging.
          </p>
        </div>
      </section>

      <section className="bg-brand-cream px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          {offerings.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-3xl bg-brand-beige/40 p-6 text-center ring-1 ring-brand-brown/5"
            >
              <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-brand-gold/15 text-brand-gold">
                <Icon className="size-4" />
              </div>
              <h4 className="mb-1 font-serif text-base font-bold text-brand-brown">{title}</h4>
              <p className="text-xs leading-relaxed text-brand-brown/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16">
        <SectionHeading eyebrow="Request a quote" title="Tell us about your gifting need" />
        <form
          className="mx-auto max-w-xl rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/10"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
        >
          <Row>
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field
              label="Company"
              value={form.company_name}
              onChange={(v) => setForm({ ...form, company_name: v })}
              required
            />
          </Row>
          <Row>
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
              required
            />
          </Row>
          <Field
            label="Requirement (qty, occasion, budget)"
            value={form.requirement}
            onChange={(v) => setForm({ ...form, requirement: v })}
            textarea
            required
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 w-full rounded-full bg-brand-brown py-3.5 text-xs font-bold uppercase tracking-widest text-brand-cream disabled:opacity-60"
          >
            {mutation.isPending ? "Submitting…" : "Submit Inquiry"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">{children}</div>;
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
