import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/breadcrumbs";
import { BRAND, getBlog } from "@/lib/catalog";
import { absUrl, BASE_URL, OG_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getBlog(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    const title = loaderData ? `${loaderData.post.title} — ${BRAND.name}` : "Article";
    const desc = loaderData?.post.excerpt ?? "";
    const img = loaderData?.post.cover ? absUrl(loaderData.post.cover) : OG_IMAGE;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absUrl(`/blog/${params.slug}`) },
        { property: "og:image", content: img },
        { name: "twitter:image", content: img },
      ],
      links: [{ rel: "canonical", href: absUrl(`/blog/${params.slug}`) }],
      scripts: loaderData ? [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.post.title,
            description: loaderData.post.excerpt,
            image: [img],
            datePublished: loaderData.post.date,
            author: { "@type": "Organization", name: BRAND.name },
            publisher: { "@type": "Organization", name: BRAND.name, logo: { "@type": "ImageObject", url: absUrl(BRAND.logo) } },
            mainEntityOfPage: absUrl(`/blog/${params.slug}`),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Journal", href: "/blog" },
            { name: loaderData.post.title, href: `/blog/${params.slug}` },
          ], BASE_URL)),
        },
      ] : [],
    };
  },
  component: Post,
});

function Post() {
  const { post } = Route.useLoaderData();
  return (
    <SiteLayout>
      <article className="container-luxe max-w-3xl py-16">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Journal", href: "/blog" }, { name: post.title }]} />
        <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {post.readMins} min read</div>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{post.title}</h1>
        <div className="mt-8 overflow-hidden rounded-lg">
          <img src={post.cover} alt={post.title} className="w-full" />
        </div>
        <div className="prose mt-10 max-w-none">
          <p className="text-lg leading-relaxed text-foreground/85">{post.content}</p>
        </div>
      </article>
    </SiteLayout>
  );
}
