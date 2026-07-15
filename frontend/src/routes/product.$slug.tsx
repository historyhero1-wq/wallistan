import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductGallery } from "@/components/product/product-gallery";
import { DynamicOptions } from "@/components/product/dynamic-options";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/site/breadcrumbs";
import { BRAND, formatPKR, getProduct, relatedProducts } from "@/lib/catalog";
import { absUrl, BASE_URL, OG_IMAGE } from "@/lib/seo";
import { Star, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProduct(params.slug);
    if (!product) throw notFound();
    const related = await relatedProducts(params.slug, 4);
    return { product, related };
  },
  head: ({ params, loaderData }) => {
    const title = loaderData ? `${loaderData.product.name} — ${BRAND.name}` : "Product";
    const desc = loaderData?.product.tagline ?? "";
    const img = loaderData?.product.images[0] ? absUrl(loaderData.product.images[0]) : OG_IMAGE;
    const categoryName = loaderData?.product.categorySlug.replace(/-/g, " ") ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: absUrl(`/product/${params.slug}`) },
        { property: "og:type", content: "product" },
        { property: "og:image", content: img },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:image", content: img },
      ],
      links: [{ rel: "canonical", href: absUrl(`/product/${params.slug}`) }],
      scripts: loaderData ? [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: loaderData.product.name,
            description: loaderData.product.description,
            image: loaderData.product.images.map((i) => absUrl(i)),
            sku: loaderData.product.slug,
            brand: { "@type": "Brand", name: BRAND.name },
            category: categoryName,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: loaderData.product.rating,
              reviewCount: loaderData.product.reviewCount,
            },
            review: loaderData.product.reviews.map((r) => ({
              "@type": "Review",
              reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
              author: { "@type": "Person", name: r.author },
              reviewBody: r.text,
            })),
            offers: {
              "@type": "Offer",
              url: absUrl(`/product/${params.slug}`),
              priceCurrency: "PKR",
              price: loaderData.product.basePrice,
              availability: (loaderData.product.stock ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: BRAND.name },
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: loaderData.product.faq.map((f) => ({
              "@type": "Question", name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            { name: categoryName, href: `/category/${loaderData.product.categorySlug}` },
            { name: loaderData.product.name, href: `/product/${params.slug}` },
          ], BASE_URL)),
        },
      ] : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const data = Route.useLoaderData() as { product: import("@/lib/catalog").Product; related: import("@/lib/catalog").Product[] };
  const { product, related } = data;
  return (
    <SiteLayout>
      <div className="container-luxe py-8">
        <Breadcrumbs items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          { name: product.categorySlug.replace(/-/g, " "), href: `/category/${product.categorySlug}` },
          { name: product.name },
        ]} />
      </div>

      <section className="container-luxe grid gap-10 pb-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-gold)]">{product.categorySlug.replace(/-/g, " ")}</div>
          <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-[color:var(--color-gold)]">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < Math.round(product.rating) ? "h-4 w-4 fill-current" : "h-4 w-4 opacity-30"} />)}
            </span>
            <span className="text-muted-foreground">{product.rating.toFixed(1)} · {product.reviewCount} reviews</span>
          </div>

          <Separator className="my-6" />

          <DynamicOptions product={product} />

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
            <Feat icon={<Truck className="h-4 w-4" />} label="Nationwide shipping" />
            <Feat icon={<ShieldCheck className="h-4 w-4" />} label="Design preview" />
            <Feat icon={<RotateCcw className="h-4 w-4" />} label="5-year warranty" />
          </div>
        </div>
      </section>

      <section className="container-luxe grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">About this piece</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {product.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-gold)]" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-2xl">Frequently asked</h2>
          <Accordion type="single" collapsible className="mt-4">
            {product.faq.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-luxe py-16">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div>
            <h2 className="font-display text-2xl">Reviews</h2>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="font-display text-5xl">{product.rating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">/ 5 · {product.reviewCount}</div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map((r, i) => (
              <div key={i} className="rounded-md border border-border bg-background p-5">
                <div className="text-[color:var(--color-gold)]">
                  {Array.from({ length: r.rating }).map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="mt-3 text-sm leading-relaxed">“{r.text}”</p>
                <footer className="mt-3 text-xs text-muted-foreground">— {r.author}, {r.city}</footer>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-luxe py-16">
          <h2 className="font-display text-2xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      {/* Spacer so content isn't hidden behind mobile sticky Buy bar */}
      <div className="h-16 lg:hidden" aria-hidden />

      {/* Mobile sticky Buy bar */}

      <div
        className="fixed inset-x-0 bottom-16 z-30 border-t border-border/70 bg-background/95 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden"
        style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Starting</div>
            <div className="font-display text-lg leading-none text-[color:var(--color-maroon)]">{formatPKR(product.basePrice)}</div>
          </div>
          <a
            href="#buy"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("buy")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-maroon)]/40 px-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-maroon)]"
          >
            Add to cart
          </a>
          <a
            href="#buy"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("buy")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[color:var(--color-gold)] px-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-gold-foreground)] shadow-md"
          >
            Buy Now
          </a>
        </div>
      </div>
    </SiteLayout>
  );
}


function Feat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border p-3">
      <span className="text-[color:var(--color-gold)]">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
