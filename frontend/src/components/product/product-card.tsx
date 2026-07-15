import { Link } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatPKR } from "@/lib/catalog";
import { useWishlist } from "@/lib/wishlist";
import { useQuickView } from "@/components/product/quick-view-dialog";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const compareAt = product.compareAtPrice;
  const hasCompare = typeof compareAt === "number" && compareAt > product.basePrice;
  const badge = product.badges?.[0] ?? (hasCompare ? "Sale" : null);
  const { has, toggle } = useWishlist();
  const { open } = useQuickView();
  const saved = has(product.slug);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[color:var(--color-gold)]/40 bg-[color:var(--color-card)] shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-[color:var(--color-gold)]/10 lg:rounded-md">
      {/* Wishlist button — overlaps image, above link */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.slug); }}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        className={cn(
          "absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors",
          saved ? "text-[color:var(--color-maroon)]" : "text-muted-foreground hover:text-[color:var(--color-maroon)]"
        )}
      >
        <Heart className={cn("h-4 w-4", saved && "fill-current")} />
      </button>

      <Link to="/product/$slug" params={{ slug: product.slug }} className="block text-left">
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-[color:var(--color-secondary)]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={1000}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          <img
            src={product.images[1] ?? product.images[0]}
            alt=""
            aria-hidden
            loading="lazy"
            width={1000}
            height={1000}
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {badge && (
            <span className="absolute left-3 top-3 rounded-sm bg-[color:var(--color-gold)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-gold-foreground)] shadow-sm">
              {badge}
            </span>
          )}

          {/* Quick View button — desktop hover, hidden on mobile */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); open(product); }}
            className="absolute inset-x-3 bottom-3 hidden translate-y-[130%] items-center justify-center gap-2 rounded-full bg-[color:var(--color-maroon)] py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-maroon-foreground)] shadow-lg transition-transform duration-300 group-hover:translate-y-0 lg:flex"
          >
            <Eye className="h-3.5 w-3.5" /> Quick View
          </button>

        </div>

        {/* BODY */}
        <div className="px-4 py-4">
          <h3 className="line-clamp-2 min-h-[2.6em] font-sans text-[13.5px] font-medium leading-snug text-foreground transition-colors group-hover:text-[color:var(--color-maroon)]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2 text-[13px]">
            {hasCompare && (
              <span className="text-muted-foreground line-through">{formatPKR(compareAt!)}</span>
            )}
            <span className="font-semibold text-[color:var(--color-maroon)]">
              {formatPKR(product.basePrice)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
