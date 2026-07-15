import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { listBlog, BRAND } from "@/lib/catalog";
import { absUrl, OG_IMAGE } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: `Journal — ${BRAND.name}` },
      { name: "description", content: "Signage design trends, decor inspiration and behind-the-scenes stories from the Wallistan studio in Multan." },
      { property: "og:title", content: `Journal — ${BRAND.name}` },
      { property: "og:url", content: absUrl("/blog") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: absUrl("/blog") }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts = [] } = useQuery({ queryKey: ["blog"], queryFn: () => listBlog() });
  return (
    <SiteLayout>
      <section className="container-luxe py-16">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-gold)]">Journal</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Design, decor & signage ideas.</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">Trends, tips and the occasional workshop story from the Wallistan team.</p>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group block">
              <div className="aspect-[4/3] overflow-hidden rounded-md bg-secondary">
                <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {p.readMins} min</div>
              <h2 className="mt-2 font-display text-xl leading-tight group-hover:text-[color:var(--color-gold)]">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
