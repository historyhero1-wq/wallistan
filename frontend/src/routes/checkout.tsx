import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { BRAND, formatPKR } from "@/lib/catalog";
import { findCoupon, couponDiscount, type Coupon } from "@/lib/coupons";
import { isWallistanEnabled } from "@/integrations/wallistan/config";
import { saveOrder } from "@/lib/order-history";
import { api } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: `Checkout — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", city: "Multan", notes: "", method: "cod" });
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    try {
      const c = window.sessionStorage.getItem("signora_coupon");
      if (c) {
        const found = findCoupon(c);
        if (found) setCoupon(found);
      }
    } catch {}
  }, []);

  const discount = couponDiscount(coupon, subtotal);
  const shipping = subtotal >= 15000 ? 0 : subtotal > 0 ? 500 : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (!isWallistanEnabled()) {
      toast.error("Store checkout is not configured yet. Please contact us on WhatsApp.");
      return;
    }

    setBusy(true);
    try {
      const notesWithCoupon = coupon
        ? `${f.notes}\n[Coupon: ${coupon.code} — ${formatPKR(discount)} off]`.trim()
        : f.notes;

      const payload = await api.post<{
        orderId?: number;
        orderNumber?: string;
        email?: string;
        error?: string;
      }>("/orders", {
        contactName: f.name,
        contactPhone: f.phone,
        contactEmail: f.email,
        shippingAddress: f.address,
        shippingCity: f.city,
        notes: notesWithCoupon,
        paymentMethod: f.method,
        subtotal,
        discount,
        shippingFee: shipping,
        total,
        couponCode: coupon?.code,
        items,
      });

      saveOrder({
        id: payload.orderId!,
        number: payload.orderNumber!,
        email: f.email.trim(),
      });

      clear();
      try {
        window.sessionStorage.removeItem("signora_coupon");
      } catch {}

      const msg =
        f.method === "cod"
          ? `Order ${payload.orderNumber} placed! We'll call to confirm.`
          : `Order ${payload.orderNumber} placed. Submit your payment details on the order page.`;
      toast.success(msg);
      nav({
        to: "/orders/$id",
        params: { id: String(payload.orderId) },
        search: { email: f.email.trim() },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="container-luxe py-24 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-flex text-[color:var(--color-gold)] hover:underline">
            Browse products →
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-luxe py-12">
        <h1 className="font-display text-4xl text-[color:var(--color-maroon)]">Checkout</h1>
        <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Shipping details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" v={f.name} onC={(v) => setF({ ...f, name: v })} required />
              <Field label="Phone" v={f.phone} onC={(v) => setF({ ...f, phone: v })} required />
              <Field label="Email" v={f.email} onC={(v) => setF({ ...f, email: v })} required />
              <Field label="City" v={f.city} onC={(v) => setF({ ...f, city: v })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Textarea value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} required rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Order notes (optional)</Label>
              <Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} />
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="font-display text-xl">Payment method</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Bank/wallet payments are manually verified — submit your transaction reference after placing your order.
                COD orders are confirmed by phone.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { v: "cod", l: "Cash on Delivery" },
                  { v: "bank_transfer", l: "Bank transfer" },
                  { v: "jazzcash", l: "JazzCash" },
                  { v: "easypaisa", l: "Easypaisa" },
                ].map((m) => (
                  <label
                    key={m.v}
                    className={
                      "cursor-pointer rounded-lg border p-3 text-center text-sm " +
                      (f.method === m.v
                        ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10"
                        : "border-border")
                    }
                  >
                    <input
                      type="radio"
                      name="method"
                      value={m.v}
                      checked={f.method === m.v}
                      onChange={() => setF({ ...f, method: m.v })}
                      className="sr-only"
                    />
                    {m.l}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Order</h2>
            <ul className="mt-4 divide-y divide-border text-sm">
              {items.map((it, i) => (
                <li key={i} className="flex justify-between py-2">
                  <span className="min-w-0 truncate pr-2">
                    {it.productName} × {it.quantity}
                  </span>
                  <span>{formatPKR(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              {coupon && discount > 0 && (
                <div className="flex justify-between text-[color:var(--color-maroon)]">
                  <span>Coupon ({coupon.code})</span>
                  <span>−{formatPKR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-lg">
                <span>Total</span>
                <span>{formatPKR(total)}</span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90"
            >
              {busy ? "Placing order…" : "Place order"}
            </Button>
          </aside>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  v,
  onC,
  required,
}: {
  label: string;
  v: string;
  onC: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && " *"}
      </Label>
      <Input value={v} onChange={(e) => onC(e.target.value)} required={required} />
    </div>
  );
}
