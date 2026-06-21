import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const PATHS = [
  { path: "/", priority: "1.0", changefreq: "weekly" as const },
  { path: "/products", priority: "0.9", changefreq: "weekly" as const },
  { path: "/about", priority: "0.6", changefreq: "monthly" as const },
  { path: "/contact", priority: "0.5", changefreq: "monthly" as const },
  { path: "/faq", priority: "0.5", changefreq: "monthly" as const },
  { path: "/corporate-gifting", priority: "0.7", changefreq: "monthly" as const },
  { path: "/festive-gifting", priority: "0.7", changefreq: "monthly" as const },
  { path: "/blog", priority: "0.6", changefreq: "weekly" as const },
];

// TODO: replace with your project URL once a name or custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap[.]xml")({
  server: {
    handlers: {
      GET: async () => {
        let productPaths: string[] = [];
        try {
          const sb = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await sb.from("products").select("slug");
          productPaths = (data ?? []).map((r: { slug: string }) => `/products/${r.slug}`);
        } catch {
          // ignore — generate sitemap without dynamic products
        }

        const all = [
          ...PATHS.map((p) => ({ ...p })),
          ...productPaths.map((path) => ({ path, priority: "0.8", changefreq: "monthly" as const })),
        ];

        const urls = all
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
