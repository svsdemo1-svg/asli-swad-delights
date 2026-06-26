import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeading } from "@/components/SectionHeading";
import { listBlogPosts } from "@/lib/blog.functions";
import { getProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Healthy Eating, Traditional Nutrition & Wellness | Healthy Delights" },
      { name: "description", content: "Stories from our kitchen — traditional nutrition, healthy eating, millet benefits, pre-workout snacks and lifestyle tips." },
      { property: "og:title", content: "Blog — Healthy Delights" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const fn = useServerFn(listBlogPosts);
  const q = useQuery({ queryKey: ["blog-posts"], queryFn: () => fn() });
  const posts = q.data ?? [];

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
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="block overflow-hidden rounded-3xl bg-brand-cream ring-1 ring-brand-brown/5 transition-shadow hover:shadow-md"
            >
              <img src={getProductImage(p.cover_image_key)} alt={p.title} className="h-48 w-full object-cover" />
              <div className="p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                  {new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <h3 className="mt-2 mb-2 font-serif text-xl font-bold text-brand-brown">{p.title}</h3>
                <p className="text-sm text-brand-brown/70">{p.excerpt}</p>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-brand-brown/60">
                  Read article →
                </span>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && (
          <p className="mt-10 text-center text-sm text-brand-brown/60">New stories landing here soon.</p>
        )}
      </section>
    </AppShell>
  );
}
