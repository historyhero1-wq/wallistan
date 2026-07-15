import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/breadcrumbs";
import { BRAND, getCategory, listProductsByCategory } from "@/lib/catalog";
import { absUrl, BASE_URL, OG_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const category = await getCategory(params.slug);
    if (!category) throw notFound();
    const products = await listProductsByCategory(params.slug);
    return { category, products };
  },
  head: ({ params, loaderData }) => {
    const title = loaderData ? `${loaderData.category.name} — ${BRAND.name}` : "Category — Wallistan";
    const desc = loaderData ? `${loaderData.category.tagline}. Shop ${loaderData.category.name.toLowerCase()} from ${BRAND.name} — designed and built in Multan.` : "";
    const img = loaderData?.category.image ? absUrl(loaderData.category.image) : OG_IMAGE;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: absUrl(`/category/${params.slug}`) },
        { property: "og:image", content: img },
        { name: "twitter:image", content: img },
      ],
      links: [{ rel: "canonical", href: absUrl(`/category/${params.slug}`) }],
      scripts: loaderData ? [{
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          { name: loaderData.category.name, href: `/category/${params.slug}` },
        ], BASE_URL)),
      }] : [],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img src={category.image} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        <div className="container-luxe py-16">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Shop", href: "/shop" }, { name: category.name }]} />
          <h1 className="mt-4 font-display text-4xl md:text-6xl">{category.name}</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">{category.tagline}</p>
        </div>
      </section>

      <section className="container-luxe pb-20">
        {products.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
            <p>No stock pieces here yet — but we build these to order.</p>
            <Link to="/custom-order" className="mt-3 inline-block text-[color:var(--color-gold)] hover:underline">Request a custom quote →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p: import("@/lib/catalog").Product) => <ProductCard key={p.slug} product={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
