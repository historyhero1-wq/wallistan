import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingBag, User, Heart, ChevronDown } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { BRAND, listCategories } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCartDrawer } from "@/components/site/cart-drawer";
import { useSearchDialog } from "@/components/site/search-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Header() {
  const [megaOpen, setMegaOpen] = useState(false);
  const { data: collections = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });
  const { count } = useCart();
  const { count: wlCount } = useWishlist();
  const { openDrawer } = useCartDrawer();
  const { openSearch } = useSearchDialog();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="container-luxe flex h-16 items-center gap-4 lg:h-[4.5rem]">
        {/* Left: logo */}
        <Link to="/" className="group flex shrink-0 items-center" aria-label="Wallistan — Home">
          <span
            className="brand-logo-wrap"
            style={{ "--brand-logo-mask": `url(${BRAND.logo})` } as CSSProperties}
          >
            <img
              src={BRAND.logo}
              alt="Wallistan"
              width={240}
              height={84}
              className="h-12 w-auto object-contain sm:h-14 lg:h-16 brand-logo"
            />
          </span>
        </Link>

        {/* Center: nav */}
        <nav
          className="hidden flex-1 items-center justify-center gap-8 text-[13px] font-medium uppercase tracking-[0.14em] lg:flex"
          onMouseLeave={() => setMegaOpen(false)}
        >
          <Link to="/" className="transition-colors hover:text-[color:var(--color-gold)]">Home</Link>
          <button
            onMouseEnter={() => setMegaOpen(true)}
            onFocus={() => setMegaOpen(true)}
            className="relative flex items-center gap-1 py-2 transition-colors hover:text-[color:var(--color-gold)]"
            aria-expanded={megaOpen}
          >
            Collections
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <Link to="/shop" className="transition-colors hover:text-[color:var(--color-gold)]">All Designs</Link>
          <Link to="/blog" className="transition-colors hover:text-[color:var(--color-gold)]">Journal</Link>
          <Link to="/about" className="transition-colors hover:text-[color:var(--color-gold)]">About</Link>
          <Link to="/contact" className="transition-colors hover:text-[color:var(--color-gold)]">Contact</Link>
        </nav>

        {/* Right: CTA + icons + mobile menu */}
        <div className="ml-auto flex items-center gap-2 lg:gap-4">
          <Button
            asChild
            className="hidden rounded-full bg-[color:var(--color-maroon)] px-5 text-[color:var(--color-maroon-foreground)] hover:bg-[color:var(--color-maroon)]/90 lg:inline-flex"
          >
            <Link to="/custom-order">
              Custom Quote <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--color-gold)]" />
            </Link>
          </Button>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" aria-label="Search" onClick={openSearch} className="hidden sm:inline-flex">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" aria-label="My orders" asChild>
              <Link to="/orders"><User className="h-5 w-5" /></Link>
            </Button>

            <Button variant="ghost" size="icon" aria-label="Wishlist" asChild className="hidden sm:inline-flex">
              <Link to="/wishlist" className="relative">
                <Heart className="h-5 w-5" />
                {wlCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--color-maroon)] px-1 text-[10px] font-semibold text-[color:var(--color-maroon-foreground)]">
                    {wlCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Cart" onClick={openDrawer} className="relative">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--color-gold)] px-1 text-[10px] font-semibold text-[color:var(--color-gold-foreground)]">
                  {count}
                </span>
              )}
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="mt-8 space-y-6 text-sm">
                <Link to="/" className="font-display text-2xl">{BRAND.name}</Link>
                <div>
                  <div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Collections</div>
                  <ul className="space-y-2">
                    {collections.map((it) => (
                      <li key={it.slug}>
                        <Link to="/category/$slug" params={{ slug: it.slug }} className="hover:text-[color:var(--color-gold)]">
                          {it.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <Link to="/shop" className="block">All Designs</Link>
                  <Link to="/blog" className="block">Journal</Link>
                  <Link to="/about" className="block">About</Link>
                  <Link to="/contact" className="block">Contact</Link>
                  <Link to="/custom-order" className="block">Custom Quote</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>


      {/* Mega menu */}
      {megaOpen && (
        <div
          className="absolute left-0 right-0 top-full hidden border-y border-border bg-background shadow-xl lg:block"
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
        >
          <div className="container-luxe grid grid-cols-[2fr_1fr] gap-10 py-10">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {collections.map((it) => (
                <li key={it.slug}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: it.slug }}
                    onClick={() => setMegaOpen(false)}
                    className="text-foreground/90 transition-colors hover:text-[color:var(--color-gold)]"
                  >
                    {it.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-l border-border/70 pl-8">
              <div className="mb-3 font-display text-xl">Not seeing it?</div>
              <p className="mb-4 text-sm text-muted-foreground">
                We build fully bespoke pieces from your idea, sketch or reference image.
              </p>
              <Link
                to="/custom-order"
                onClick={() => setMegaOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-maroon)] px-5 py-2 text-sm font-medium text-[color:var(--color-maroon-foreground)] hover:bg-[color:var(--color-maroon)]/90"
              >
                Start a custom quote →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
