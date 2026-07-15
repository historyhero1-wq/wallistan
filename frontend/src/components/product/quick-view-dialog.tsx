import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPKR, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useCartDrawer } from "@/components/site/cart-drawer";

interface QVCtx { open: (p: Product) => void; }
const Ctx = createContext<QVCtx | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const value = useMemo(() => ({ open: (p: Product) => setProduct(p) }), []);
  return (
    <Ctx.Provider value={value}>
      {children}
      <QuickView product={product} onClose={() => setProduct(null)} />
    </Ctx.Provider>
  );
}

export function useQuickView() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuickView must be inside QuickViewProvider");
  return ctx;
}

function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const { openDrawer } = useCartDrawer();
  const [qty, setQty] = useState(1);
  const compareAt = product?.compareAtPrice;
  const hasCompare = product && typeof compareAt === "number" && compareAt > product.basePrice;

  function addToCart() {
    if (!product) return;
    add({
      productSlug: product.slug,
      productName: product.name,
      imageUrl: product.images[0],
      unitPrice: product.basePrice,
      quantity: qty,
      selectedOptions: {},
      customUploads: [],
    });
    onClose();
    setQty(1);
    toast.success(`${product.name} added to cart`);
    openDrawer();
  }

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        {product && (
          <div className="grid gap-0 sm:grid-cols-2">
            <div className="aspect-square overflow-hidden bg-secondary">
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <DialogHeader>
                <DialogTitle className="text-left font-display text-2xl leading-tight text-foreground">
                  {product.name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-baseline gap-2">
                {hasCompare && (
                  <span className="text-sm text-muted-foreground line-through">{formatPKR(compareAt!)}</span>
                )}
                <span className="text-xl font-semibold text-[color:var(--color-maroon)]">
                  {formatPKR(product.basePrice)}
                </span>
              </div>
              <p className="line-clamp-4 text-sm text-muted-foreground">{product.description}</p>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1.5 text-lg leading-none">−</button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="px-3 py-1.5 text-lg leading-none">+</button>
                </div>
                <Button onClick={addToCart} className="flex-1 rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90">
                  Add to cart
                </Button>
              </div>

              <Button asChild variant="outline" className="rounded-full">
                <Link to="/product/$slug" params={{ slug: product.slug }} onClick={onClose}>
                  View full details →
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
