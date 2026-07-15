import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { formatPKR, BRAND } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listSavedOrders, saveOrder, type SavedOrder } from "@/lib/order-history";
import type { WooOrderDetail } from "@/integrations/woocommerce/types";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: `My orders — ${BRAND.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

async function fetchOrderSummary(saved: SavedOrder): Promise<WooOrderDetail | null> {
  const res = await fetch(
    `/api/wallistan/orders/${saved.id}?email=${encodeURIComponent(saved.email)}`,
  );
  if (!res.ok) return null;
  return res.json() as Promise<WooOrderDetail>;
}

function OrdersPage() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState<SavedOrder[]>(() => listSavedOrders());
  const [lookupNumber, setLookupNumber] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", saved.map((o) => `${o.id}:${o.email}`).join(",")],
    queryFn: async () => {
      const results = await Promise.all(saved.map((s) => fetchOrderSummary(s)));
      return results.filter((o): o is WooOrderDetail => o !== null);
    },
    enabled: saved.length > 0,
  });

  async function lookupOrder(e: React.FormEvent) {
    e.preventDefault();
    setLookupBusy(true);
    try {
      const res = await fetch(
        `/api/wallistan/orders/lookup?number=${encodeURIComponent(lookupNumber)}&email=${encodeURIComponent(lookupEmail)}`,
      );
      const payload = (await res.json()) as WooOrderDetail & { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Order not found");

      const entry: SavedOrder = {
        id: payload.id,
        number: payload.number,
        email: lookupEmail.trim(),
      };
      saveOrder(entry);
      setSaved(listSavedOrders());
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success(`Order ${payload.number} added`);
      setLookupNumber("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not find order");
    } finally {
      setLookupBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="container-luxe py-16">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Orders</div>
          <h1 className="mt-2 font-display text-4xl text-[color:var(--color-maroon)]">My orders</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Orders from this device appear below. To find an older order, enter your order number and checkout email.
          </p>
        </div>

        <form onSubmit={lookupOrder} className="mb-10 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Track an order</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="order-number">Order number</Label>
              <Input
                id="order-number"
                required
                value={lookupNumber}
                onChange={(e) => setLookupNumber(e.target.value)}
                placeholder="e.g. 1042"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-email">Email used at checkout</Label>
              <Input
                id="order-email"
                type="email"
                required
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={lookupBusy}
            className="mt-4 rounded-full bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)]"
          >
            {lookupBusy ? "Looking up…" : "Find order"}
          </Button>
        </form>

        {saved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No orders on this device yet.</p>
            <Link to="/shop" className="mt-4 inline-flex text-[color:var(--color-gold)] hover:underline">
              Browse the shop →
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-sm text-muted-foreground">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Could not load saved orders. Try finding them again above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/orders/$id"
                params={{ id: String(o.id) }}
                search={{ email: o.billing.email }}
                className="block rounded-xl border border-border bg-card p-6 transition hover:border-[color:var(--color-gold)]"
              >
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="font-display text-lg">#{o.number}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.date_created).toLocaleDateString()} · {o.line_items.length} item(s) ·{" "}
                      {o.payment_method_title}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Badge variant="outline" className="border-[color:var(--color-gold)]/50 text-[color:var(--color-maroon)]">
                      {o.status.replace(/-/g, " ")}
                    </Badge>
                    <div className="font-display text-lg">{formatPKR(Number(o.total))}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
