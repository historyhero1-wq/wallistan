import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listBlog, listCategories, listProducts } from "@/lib/catalog";

import { BASE_URL } from "@/lib/seo";
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
  /** Absolute image URLs to include as <image:image> children (Google image sitemap). */
  images?: string[];
}

function absImg(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${BASE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [cats, prods, posts] = await Promise.all([listCategories(), listProducts(), listBlog()]);
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: TODAY },
          { path: "/shop", changefreq: "weekly", priority: "0.9", lastmod: TODAY },
          { path: "/custom-order", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/about", changefreq: "monthly", priority: "0.5", lastmod: TODAY },
          { path: "/contact", changefreq: "monthly", priority: "0.5", lastmod: TODAY },
          { path: "/faq", changefreq: "monthly", priority: "0.5", lastmod: TODAY },
          { path: "/blog", changefreq: "weekly", priority: "0.7", lastmod: TODAY },
          ...cats.map((c) => ({
            path: `/category/${c.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: TODAY,
            images: [absImg(c.image)],
          })),
          ...prods.map((p) => ({
            path: `/product/${p.slug}`,
            changefreq: "weekly",
            priority: "0.8",
            lastmod: TODAY,
            images: p.images.map(absImg),
          })),
          ...posts.map((p) => ({
            path: `/blog/${p.slug}`,
            changefreq: "monthly",
            priority: "0.6",
            lastmod: p.date ?? TODAY,
            images: p.cover ? [absImg(p.cover)] : undefined,
          })),
        ];

        const urls = entries.map((e) => {
          const parts = [
            "  <url>",
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            ...(e.images ?? []).map((img) => `    <image:image><image:loc>${xmlEscape(img)}</image:loc></image:image>`),
            "  </url>",
          ];
          return parts.filter(Boolean).join("\n");
        });

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
