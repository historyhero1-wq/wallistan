import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { Search, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useCartDrawer } from "@/components/site/cart-drawer";
import { useSearchDialog } from "@/components/site/search-dialog";

export function MobileHeader() {
  const { count } = useCart();
  const { count: wlCount } = useWishlist();
  const { openDrawer } = useCartDrawer();
  const { openSearch } = useSearchDialog();

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur lg:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center" aria-label="Wallistan — Home">
          <span
            className="brand-logo-wrap"
            style={{ "--brand-logo-mask": `url(${BRAND.logo})` } as CSSProperties}
          >
            <img
              src={BRAND.logo}
              alt="Wallistan"
              width={220}
              height={78}
              className="h-12 w-auto object-contain brand-logo"
            />
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={openSearch} className="h-9 w-9">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist" asChild className="h-9 w-9">
            <Link to="/wishlist" className="relative">
              <Heart className="h-5 w-5" />
              {wlCount > 0 && (
                <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--color-maroon)] px-1 text-[10px] font-semibold text-[color:var(--color-maroon-foreground)]">
                  {wlCount}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cart" onClick={openDrawer} className="relative h-9 w-9">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--color-gold)] px-1 text-[10px] font-semibold text-[color:var(--color-gold-foreground)]">
                {count}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
