import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";

const posts = [
  {
    slug: "why-traditional-laddoos-are-the-modern-superfood",
    title: "Why Traditional Laddoos Are the Modern Superfood",
    category: "Healthy Eating",
    excerpt: "Ghee, jaggery, gondh, nuts — ancient wisdom that fuels modern, active lives.",
  },
  {
    slug: "millet-laddoos-everything-you-need-to-know",
    title: "Millet Laddoos: Everything You Need to Know",
    category: "Millet Benefits",
    excerpt: "From ragi to rajgira — what each millet does and how to enjoy them daily.",
  },
  {
    slug: "best-pre-workout-snacks-from-indian-kitchens",
    title: "5 Best Pre-Workout Snacks From Indian Kitchens",
    category: "Fitness Snacks",
    excerpt: "Forget protein bars. Try sattu, dates and dry-fruit laddoos for clean energy.",
  },
  {
    slug: "panjiri-the-postpartum-superfood-our-grandmothers-knew",
    title: "Panjiri: The Postpartum Superfood Our Grandmothers Knew",
    category: "Traditional Nutrition",
    excerpt: "Why this slow-roasted wheat & gondh blend has lasted for centuries.",
  },
];

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Healthy Eating, Traditional Nutrition & Wellness | Healthy Delights" },
      {
        name: "description",
        content: "Stories from our kitchen — traditional nutrition, healthy eating, millet benefits, pre-workout snacks and lifestyle tips.",
      },
      { property: "og:title", content: "Blog — Healthy Delights" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <AppShell>
      <section className="bg-brand-cream px-6 pt-12 pb-6">
        <SectionHeading
          eyebrow="Stories from our kitchen"
          title="The Healthy Delights Journal"
          subtitle="Healthy eating, traditional nutrition, millet benefits, dry fruits, fitness snacks & lifestyle."
        />
      </section>

      <section className="bg-brand-beige/30 px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.slug}
              to="/blog"
              className="block rounded-3xl bg-brand-cream p-6 ring-1 ring-brand-brown/5 transition-shadow hover:shadow-md"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                {p.category}
              </span>
              <h3 className="mt-2 mb-2 font-serif text-xl font-bold text-brand-brown">
                {p.title}
              </h3>
              <p className="text-sm text-brand-brown/70">{p.excerpt}</p>
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-brand-brown/60">
                Coming soon →
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-brand-brown/60">
          More stories landing here soon — subscribe to our newsletter to get them first.
        </p>
      </section>
    </AppShell>
  );
}
