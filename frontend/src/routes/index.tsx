import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Truck, ShieldCheck, Sparkles, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/product/product-card";
import { HeroSlider, type HeroSlide } from "@/components/site/hero-slider";
import { InstagramFeed } from "@/components/site/instagram-feed";
import { Button } from "@/components/ui/button";
import { listCategories, listProducts, BRAND } from "@/lib/catalog";
import { ProductScrollRow } from "@/components/site/product-scroll-row";
import { absUrl, OG_IMAGE } from "@/lib/seo";
import heroImg from "@/assets/hero.jpg";
import catNeon from "@/assets/cat-neon.jpg";
import catShop from "@/assets/cat-shop.jpg";

const heroSlides: HeroSlide[] = [
  {
    image: heroImg,
    eyebrow: "Signature Collection",
    title: (<>Premium 3D <br /> Signs &amp; Wall Decor</>),
    subtitle: "Elegant acrylic, neon & hand-built pieces",
    ctaLabel: "Shop Signs",
    ctaTo: "/shop",
    ctaLabel2: "Custom Order",
    ctaTo2: "/custom-order",
  },
  {
    image: catNeon,
    eyebrow: "LED Neon Signs",
    title: (<>Glow that <br /> tells your story</>),
    subtitle: "Custom neon for cafes, salons & homes",
    ctaLabel: "Shop Neon",
    ctaTo: "/shop",
    ctaLabel2: "Get a Quote",
    ctaTo2: "/custom-order",
  },
  {
    image: catShop,
    eyebrow: "For Businesses",
    title: (<>Shop &amp; office <br /> signage that sells</>),
    subtitle: "Design preview in 48 hours — nationwide install",
    ctaLabel: "Business Signs",
    ctaTo: "/shop",
    ctaLabel2: "Talk to Studio",
    ctaTo2: "/contact",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — 3D Signs, LED Neon & Wall Decor` },
      { name: "description", content: "Design-led custom 3D sign boards, LED neon signs, acrylic logo signs and home wall decor. Built in Multan, shipped nationwide across Pakistan." },
      { property: "og:title", content: `${BRAND.name} — Premium Custom Signage` },
      { property: "og:description", content: "Design-led custom 3D sign boards, LED neon signs, acrylic logo signs and home wall decor. Built in Multan, shipped nationwide across Pakistan." },
      { property: "og:url", content: absUrl("/") },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: absUrl("/") },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" },
    ],
  }),
  component: Home,
});


function Home() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const { data: allProducts = [] } = useQuery({ queryKey: ["all-products"], queryFn: () => listProducts() });
  const newArrivals = allProducts.slice(-8).reverse();

  const categoryRows = categories
    .map((category) => ({
      category,
      products: allProducts.filter((p) => p.categorySlug === category.slug),
    }))
    .filter((row) => row.products.length > 0);

  return (
    <SiteLayout>
      <HeroSlider slides={heroSlides} />

      {/* Trust bar */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-luxe grid grid-cols-2 gap-6 py-6 text-sm md:grid-cols-4">
          <Trust icon={<Award className="h-4 w-4" />} label="5-year LED warranty" />
          <Trust icon={<Truck className="h-4 w-4" />} label="Free shipping over PKR 15,000" />
          <Trust icon={<ShieldCheck className="h-4 w-4" />} label="Design preview before build" />
          <Trust icon={<Sparkles className="h-4 w-4" />} label="Free install in Multan" />
        </div>
      </section>


      {/* OUR BEST SELLERS */}
      <section className="container-luxe py-10 lg:py-20">
        <div className="flex items-end justify-between lg:block lg:text-center">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gold)] lg:text-xs">Shop</div>
            <h2 className="mt-1 font-display text-2xl lg:mt-3 lg:text-5xl">Best Sellers</h2>
          </div>
          <Link to="/shop" className="text-xs font-medium text-[color:var(--color-maroon)] lg:hidden">See all →</Link>
        </div>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          Handpicked pieces our customers love most — crafted, illuminated, ready to install.
        </p>
        {categoryRows.map(({ category, products }) => (
          <ProductScrollRow
            key={category.slug}
            title={category.name}
            subtitle={category.tagline}
            products={products}
            categorySlug={category.slug}
          />
        ))}
        <div className="mt-8 text-center lg:mt-10">
          <Button asChild variant="outline" className="rounded-full border-[color:var(--color-maroon)]/40 px-8 text-[color:var(--color-maroon)] hover:bg-[color:var(--color-maroon)] hover:text-[color:var(--color-maroon-foreground)]">
            <Link to="/shop">View All Designs →</Link>
          </Button>
        </div>

      </section>


      {/* COLLECTIONS — Shop by category (mobile: horizontal scroll rail) */}
      <section className="border-y border-border bg-secondary/30 py-10 lg:py-20">
        <div className="container-luxe">
          <div className="flex items-end justify-between lg:block lg:text-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gold)] lg:text-xs">Collections</div>
              <h2 className="mt-1 font-display text-2xl lg:mt-3 lg:text-5xl">Shop by Category</h2>
            </div>
            <Link to="/shop" className="text-xs font-medium text-[color:var(--color-maroon)] lg:hidden">See all →</Link>
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
            {categories.slice(0, 8).map((c) => (
              <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group w-32 shrink-0 snap-start">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary shadow-sm">
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                </div>
                <div className="mt-2 line-clamp-2 text-center text-[12px] font-medium leading-snug">{c.name}</div>
              </Link>
            ))}
          </div>

          {/* Desktop grid */}
          <div className="mt-12 hidden gap-4 md:grid-cols-3 lg:grid lg:grid-cols-4 lg:gap-6">
            {categories.slice(0, 8).map((c) => (
              <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary">
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 text-white">
                    <div className="font-display text-lg leading-tight">{c.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] opacity-90">Shop now →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section className="container-luxe py-10 lg:py-20">
          <div className="flex items-end justify-between lg:block lg:text-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gold)] lg:text-xs">Just In</div>
              <h2 className="mt-1 font-display text-2xl lg:mt-3 lg:text-5xl">New Arrivals</h2>
            </div>
            <Link to="/shop" className="text-xs font-medium text-[color:var(--color-maroon)] lg:hidden">See all →</Link>
          </div>
          <p className="mx-auto mt-3 hidden max-w-xl text-center text-sm text-muted-foreground lg:block">
            The latest additions from the studio — fresh designs, fresh inspiration.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:mt-12 lg:gap-6 lg:grid-cols-4">
            {newArrivals.slice(0, 8).map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}




      {/* HOW IT WORKS */}
      <section className="container-luxe py-20">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gold)]">Process</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">From idea to installed</h2>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { t: "Tell us your idea", d: "Share dimensions, references, your logo or a sketch." },
            { t: "Design preview", d: "We send a 3D mockup for approval within 48 hours." },
            { t: "Studio build", d: "Hand-built in our Multan workshop, 7–14 days." },
            { t: "Delivery & install", d: "Nationwide courier or on-site install by our team." },
          ].map((s, i) => (
            <li key={s.t} className="rounded-md border border-border bg-card p-6">
              <div className="mb-3 flex items-center gap-2 text-[color:var(--color-gold)]">
                <div className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--color-gold)]/50 font-display text-base">{i + 1}</div>
                <div className="text-xs uppercase tracking-widest">Step</div>
              </div>
              <div className="font-display text-lg">{s.t}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="container-luxe">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-gold)]">Customers</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">What Our Clients Say</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { q: "The reception wall looks like a five-star hotel. Worth every rupee.", a: "Hamza R.", c: "Lahore" },
              { q: "Our footfall jumped 40% the week the new sign went up.", a: "Faisal Q.", c: "Multan" },
              { q: "Everyone who walks into the salon photographs the neon.", a: "Sara T.", c: "Lahore" },
            ].map((t) => (
              <blockquote key={t.a} className="rounded-md border border-border bg-card p-8">
                <div className="flex gap-0.5 text-[color:var(--color-gold)]">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 font-display text-lg leading-snug">“{t.q}”</p>
                <footer className="mt-4 text-sm text-muted-foreground">— {t.a}, {t.c}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <InstagramFeed />

      {/* CTA */}

      <section className="border-b border-border bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)]">
        <div className="container-luxe grid items-center gap-6 py-16 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="text-xs uppercase tracking-widest text-[color:var(--color-gold)]">Bespoke</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Can't find it? We'll build it.</h2>
            <p className="mt-3 max-w-lg opacity-80">Send us a sketch, a Pinterest board, or just an idea. Our design team responds within 24 hours with a mockup and quote.</p>
          </div>
          <div className="flex gap-3 md:justify-end">
            <Button size="lg" asChild className="rounded-full bg-[color:var(--color-gold)] px-8 text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90">
              <Link to="/custom-order">Start a custom quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-[color:var(--color-gold)]">{icon}</span>
      <span className="text-foreground">{label}</span>
    </div>
  );
}
