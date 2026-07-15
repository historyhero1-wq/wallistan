import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";

type ProductScrollRowProps = {
  title: string;
  subtitle?: string;
  products: Product[];
  categorySlug?: string;
};

export function ProductScrollRow({ title, subtitle, products, categorySlug }: ProductScrollRowProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-8 first:mt-5 lg:mt-10">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl lg:text-2xl">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {categorySlug && (
          <Link
            to="/category/$slug"
            params={{ slug: categorySlug }}
            className="shrink-0 text-xs font-medium text-[color:var(--color-maroon)] hover:underline lg:text-sm"
          >
            See all →
          </Link>
        )}
      </div>
      <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:-mx-0 lg:mt-5 lg:gap-5 lg:px-0">
        {products.map((product) => (
          <div key={product.slug} className="w-[44vw] shrink-0 snap-start sm:w-52 md:w-56 lg:w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
