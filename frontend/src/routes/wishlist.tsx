import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, X } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { listProducts, BRAND } from "@/lib/catalog";
import { useWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: `Wishlist — ${BRAND.name}` },
      { name: "description", content: "Your saved sign designs and wall decor pieces." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { slugs, clear, remove } = useWishlist();
  const { data: all = [] } = useQuery({ queryKey: ["all-products"], queryFn: () => listProducts() });
  const items = all.filter((p) => slugs.includes(p.slug));

  return (
    <SiteLayout>
      <section className="container-luxe py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-[color:var(--color-maroon)]">Your wishlist</h1>
            <p className="mt-2 text-sm text-muted-foreground">{items.length} saved item{items.length === 1 ? "" : "s"}</p>
          </div>
          {items.length > 0 && (
            <Button variant="ghost" onClick={clear} className="text-muted-foreground hover:text-destructive">
              <X className="mr-1 h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-[color:var(--color-gold)]">
              <Heart className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Nothing saved yet. Tap the heart on any product to save it.</p>
            <Button asChild className="mt-6 rounded-full bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)]">
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {items.map((p) => (
              <div key={p.slug} className="relative">
                <ProductCard product={p} />
                <button
                  onClick={() => remove(p.slug)}
                  aria-label="Remove"
                  className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
