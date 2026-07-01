import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

const CANONICAL = "https://asli-swad-delights.lovable.app/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Healthy Delights" },
      { name: "description", content: "How Healthy Delights collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Healthy Delights" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <AppShell>
      <article className="prose prose-sm mx-auto max-w-3xl px-5 py-16 text-brand-brown">
        <h1 className="font-serif text-3xl font-bold">Privacy Policy</h1>
        <p className="text-xs uppercase tracking-widest text-brand-brown/60">
          Last updated: [FILL BEFORE LAUNCH]
        </p>
        <p>
          Healthy Delights ("we", "us", "our") operates this website. This policy explains what
          personal data we collect, how we use it, and your rights.
        </p>
        <h2>1. Information we collect</h2>
        <ul>
          <li>Name, email, phone and shipping address you provide during checkout or account signup.</li>
          <li>Order history and preferences.</li>
          <li>Basic analytics data (pages viewed, device type) — see Cookies below.</li>
        </ul>
        <h2>2. How we use it</h2>
        <ul>
          <li>Fulfil and ship your orders.</li>
          <li>Respond to enquiries and support requests.</li>
          <li>Send order updates and (with consent) marketing emails.</li>
          <li>Improve our website and product range.</li>
        </ul>
        <h2>3. Sharing</h2>
        <p>
          We do not sell your data. We share limited data only with our shipping partner
          [FILL BEFORE LAUNCH], payment processor [FILL BEFORE LAUNCH] and email service Resend,
          strictly to fulfil orders.
        </p>
        <h2>4. Cookies & analytics</h2>
        <p>
          We use essential cookies and Google Analytics 4 (when enabled) to understand site usage.
          You can disable cookies in your browser.
        </p>
        <h2>5. Data retention</h2>
        <p>Order data is retained for [FILL BEFORE LAUNCH] years for legal and tax purposes.</p>
        <h2>6. Your rights</h2>
        <p>
          You may request access, correction or deletion of your data by writing to
          <strong> [FILL BEFORE LAUNCH — support email]</strong>.
        </p>
        <h2>7. Contact</h2>
        <p>
          Healthy Delights<br />
          [FILL BEFORE LAUNCH — registered address]<br />
          Email: [FILL BEFORE LAUNCH]<br />
          Phone: [FILL BEFORE LAUNCH]
        </p>
      </article>
    </AppShell>
  );
}
