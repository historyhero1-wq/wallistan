import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/product/product-card";
import { listCategories, listProducts, BRAND } from "@/lib/catalog";
import { absUrl, OG_IMAGE } from "@/lib/seo";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: `Shop — ${BRAND.name}` },
      { name: "description", content: "Shop 3D sign boards, LED neon signs, acrylic logos, shop and office signage, name plates, and handcrafted wall decor." },
      { property: "og:title", content: `Shop — ${BRAND.name}` },
      { property: "og:description", content: "Premium custom signage and home wall decor." },
      { property: "og:url", content: absUrl("/shop") },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: absUrl("/shop") }],
  }),
  component: Shop,
});

function Shop() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });

  return (
    <SiteLayout>
      <div className="container-luxe py-14">
        <nav className="mb-4 text-xs text-muted-foreground"><Link to="/" className="hover:text-foreground">Home</Link> / Shop</nav>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl">Shop</h1>
            <p className="mt-2 text-muted-foreground">Every category we build for.</p>
          </div>
          <div className="text-sm text-muted-foreground">{products.length} products</div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="text-sm">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Categories</div>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to="/category/$slug" params={{ slug: c.slug }} className="text-foreground/80 hover:text-[color:var(--color-gold)]">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
