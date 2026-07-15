import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Trash2, Tag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR, BRAND } from "@/lib/catalog";
import { findCoupon, couponDiscount, type Coupon } from "@/lib/coupons";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: `Cart — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: Cart,
});

function Cart() {
  const { items, subtotal, remove, setQty } = useCart();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState("");
  const discount = couponDiscount(coupon, subtotal);
  const total = Math.max(0, subtotal - discount);

  function applyCoupon() {
    const c = findCoupon(code);
    if (!c) { toast.error("Invalid coupon code"); return; }
    if (c.minSubtotal && subtotal < c.minSubtotal) {
      toast.error(`Requires subtotal of ${formatPKR(c.minSubtotal)} or more`); return;
    }
    setCoupon(c);
    try { window.sessionStorage.setItem("signora_coupon", c.code); } catch {}
    toast.success(`Applied: ${c.label}`);
  }
  function removeCoupon() {
    setCoupon(null); setCode("");
    try { window.sessionStorage.removeItem("signora_coupon"); } catch {}
  }

  if (items.length === 0) {
    return (
      <SiteLayout>
        <section className="container-luxe py-24">
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-[color:var(--color-gold)]"><ShoppingBag className="h-6 w-6" /></div>
            <h1 className="mt-5 font-display text-3xl">Your cart is empty</h1>
            <p className="mt-2 text-sm text-muted-foreground">Browse our signage collections or request a custom quote.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild className="rounded-full bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)] hover:bg-[color:var(--color-maroon)]/90"><Link to="/shop">Continue shopping</Link></Button>
              <Button asChild variant="outline" className="rounded-full"><Link to="/custom-order">Request a quote</Link></Button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-luxe py-16">
        <h1 className="font-display text-4xl text-[color:var(--color-maroon)]">Your cart</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {items.map((it, i) => (
              <li key={i} className="grid grid-cols-[64px_1fr_auto] items-center gap-4 p-4">
                <div className="h-16 w-16 overflow-hidden rounded-md bg-secondary">
                  {it.imageUrl && <img src={it.imageUrl} alt={it.productName} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{it.productName}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {Object.entries(it.selectedOptions).slice(0, 3).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") || "—"}
                  </div>
                  <div className="mt-1 text-sm">{formatPKR(it.unitPrice)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Input type="number" min={1} value={it.quantity} onChange={(e) => setQty(i, Number(e.target.value))} className="w-16" />
                  <button onClick={() => remove(i)} aria-label="Remove" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Order summary</h2>

            {/* Coupon input */}
            <div className="rounded-lg border border-dashed border-[color:var(--color-gold)]/50 bg-[color:var(--color-gold)]/5 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-maroon)]">
                <Tag className="h-3.5 w-3.5" /> Coupon code
              </div>
              {coupon ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[color:var(--color-maroon)]">{coupon.code}</span>
                  <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Try SIGNORA10" className="h-9 text-sm" />
                  <Button onClick={applyCoupon} className="h-9 rounded-full bg-[color:var(--color-maroon)] px-4 text-xs text-[color:var(--color-maroon-foreground)]">Apply</Button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-[color:var(--color-maroon)]"><span>Discount</span><span>−{formatPKR(discount)}</span></div>
              )}
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{subtotal >= 15000 ? "Free" : "Calculated at checkout"}</span></div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg"><span>Total</span><span>{formatPKR(total)}</span></div>
            </div>
            <Button asChild className="w-full rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90">
              <Link to="/checkout">Continue to checkout</Link>
            </Button>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
