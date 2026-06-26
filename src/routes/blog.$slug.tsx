import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppShell } from "@/components/layout/AppShell";
import { getBlogPost } from "@/lib/blog.functions";
import { getProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => ({ slug: params.slug }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.slug ?? "Article"} — Healthy Delights Blog` },
      { property: "og:type", content: "article" },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getBlogPost);
  const q = useQuery({ queryKey: ["blog", slug], queryFn: () => fn({ data: { slug } }) });
  if (q.isLoading) return <AppShell><div className="px-5 py-10 text-center text-brand-brown/60">Loading…</div></AppShell>;
  if (!q.data) throw notFound();
  const p = q.data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.seo_description ?? p.excerpt,
    author: { "@type": "Person", name: p.author },
    datePublished: p.published_at,
    image: getProductImage(p.cover_image_key),
  };

  return (
    <AppShell>
      <article className="mx-auto max-w-2xl px-5 py-10">
        <Link to="/blog" className="text-xs font-bold uppercase tracking-widest text-brand-brown/60">← All articles</Link>
        <h1 className="mt-4 mb-3 font-serif text-3xl font-bold text-brand-brown md:text-4xl">{p.title}</h1>
        <p className="mb-6 text-sm text-brand-brown/60">
          {p.author} · {new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <img src={getProductImage(p.cover_image_key)} alt={p.title} className="mb-8 aspect-[16/9] w-full rounded-3xl object-cover" />
        <div className="prose prose-brown max-w-none text-brand-brown [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:mb-1.5 [&_a]:text-brand-gold [&_a]:underline [&_strong]:font-bold">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.body_markdown}</ReactMarkdown>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </article>
    </AppShell>
  );
}
