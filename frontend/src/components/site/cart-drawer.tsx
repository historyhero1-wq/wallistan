import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/catalog";

interface DrawerCtx {
  open: boolean;
  setOpen: (o: boolean) => void;
  openDrawer: () => void;
}

const Ctx = createContext<DrawerCtx | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen, openDrawer: () => setOpen(true) }), [open]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

export function useCartDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCartDrawer must be inside CartDrawerProvider");
  return ctx;
}

function CartDrawer() {
  const { open, setOpen } = useCartDrawer();
  const { items, subtotal, remove, setQty } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl text-[color:var(--color-maroon)]">
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-[color:var(--color-gold)]">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button asChild onClick={() => setOpen(false)} className="rounded-full bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)]">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="-mx-2 flex-1 divide-y divide-border overflow-y-auto px-2">
              {items.map((it, i) => (
                <li key={i} className="grid grid-cols-[60px_1fr_auto] items-center gap-3 py-3">
                  <div className="h-16 w-16 overflow-hidden rounded bg-secondary">
                    {it.imageUrl && <img src={it.imageUrl} alt={it.productName} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{it.productName}</div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {Object.entries(it.selectedOptions).slice(0, 2).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => setQty(i, Number(e.target.value))}
                        className="h-7 w-14 text-xs"
                      />
                      <span className="text-sm font-semibold text-[color:var(--color-maroon)]">
                        {formatPKR(it.unitPrice * it.quantity)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => remove(i)} aria-label="Remove" className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPKR(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {subtotal >= 15000 ? "🎉 You qualify for free shipping!" : `Add ${formatPKR(15000 - subtotal)} more for free shipping.`}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" onClick={() => setOpen(false)} className="rounded-full">
                  <Link to="/cart">View cart</Link>
                </Button>
                <Button asChild onClick={() => setOpen(false)} className="rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90">
                  <Link to="/checkout">Checkout</Link>
                </Button>
              </div>
              <button onClick={() => setOpen(false)} className="mx-auto flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" /> Close
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
