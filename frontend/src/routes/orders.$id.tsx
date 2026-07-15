import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/site-layout";
import { formatPKR, BRAND } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WooOrderDetail } from "@/integrations/woocommerce/types";

const searchSchema = z.object({
  email: z.string().optional(),
});

export const Route = createFileRoute("/orders/$id")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: `Order — ${BRAND.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { email: searchEmail } = Route.useSearch();
  const qc = useQueryClient();
  const [email, setEmail] = useState(searchEmail ?? "");
  const [method, setMethod] = useState("bank_transfer");
  const [ref, setRef] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id, email],
    queryFn: async () => {
      if (!email.trim()) return null;
      const res = await fetch(
        `/api/wallistan/orders/${id}?email=${encodeURIComponent(email.trim())}`,
      );
      const payload = (await res.json()) as WooOrderDetail & { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Order not found");
      return payload;
    },
    enabled: !!email.trim(),
    retry: false,
  });

  async function submitProof(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/wallistan/orders/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          method,
          reference: ref,
          message,
        }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Could not submit");
      toast.success("Payment details submitted — we'll verify within 24h.");
      setRef("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["order", id, email] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  if (!email.trim()) {
    return (
      <SiteLayout>
        <section className="container-luxe py-16">
          <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
            ← All orders
          </Link>
          <h1 className="mt-4 font-display text-3xl text-[color:var(--color-maroon)]">View order</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email you used at checkout to view this order.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void refetch();
            }}
            className="mt-6 max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <div className="space-y-1.5">
              <Label htmlFor="verify-email">Email</Label>
              <Input
                id="verify-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="rounded-full bg-[color:var(--color-maroon)] text-[color:var(--color-maroon-foreground)]">
              Continue
            </Button>
          </form>
        </section>
      </SiteLayout>
    );
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-luxe py-16">Loading…</div>
      </SiteLayout>
    );
  }

  if (error || !order) {
    return (
      <SiteLayout>
        <section className="container-luxe py-16">
          <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
            ← All orders
          </Link>
          <p className="mt-4 text-muted-foreground">
            {error instanceof Error ? error.message : "Order not found"}
          </p>
        </section>
      </SiteLayout>
    );
  }

  const contactName = `${order.billing.first_name} ${order.billing.last_name}`.trim();
  const subtotal = order.line_items.reduce((sum, it) => sum + Number(it.subtotal), 0);

  return (
    <SiteLayout>
      <section className="container-luxe py-16">
        <Link to="/orders" className="text-sm text-muted-foreground hover:text-foreground">
          ← All orders
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-gold)]">Order</div>
            <h1 className="mt-1 font-display text-4xl text-[color:var(--color-maroon)]">#{order.number}</h1>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(order.date_created).toLocaleString()}
            </div>
          </div>
          <Badge variant="outline" className="border-[color:var(--color-gold)]/50 px-4 py-1.5 text-[color:var(--color-maroon)]">
            {order.status.replace(/-/g, " ")}
          </Badge>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl">Items</h2>
            <ul className="mt-4 divide-y divide-border">
              {order.line_items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Qty {it.quantity} · {formatPKR(Number(it.price))}
                    </div>
                  </div>
                  <div className="font-display">{formatPKR(Number(it.total))}</div>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1 border-t border-border pt-4 text-sm">
              <Row l="Subtotal" v={formatPKR(subtotal)} />
              {Number(order.discount_total) > 0 && (
                <Row l="Discount" v={`− ${formatPKR(Number(order.discount_total))}`} />
              )}
              <Row
                l="Shipping"
                v={Number(order.shipping_total) === 0 ? "Free" : formatPKR(Number(order.shipping_total))}
              />
              <Row l="Total" v={formatPKR(Number(order.total))} bold />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-xl">Shipping</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {contactName} · {order.billing.phone}
              </p>
              <p className="mt-1 text-sm">
                {order.shipping.address_1}, {order.shipping.city}
              </p>
            </div>

            {order.status === "on-hold" && (
              <form onSubmit={submitProof} className="rounded-xl border border-[color:var(--color-gold)]/40 bg-card p-6">
                <h2 className="font-display text-xl">Submit payment details</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pay via JazzCash / Easypaisa / bank transfer, then send your transaction reference here.
                  For screenshots, message us on WhatsApp.
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <Label>Method</Label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="bank_transfer">Bank transfer</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">Easypaisa</option>
                    </select>
                  </div>
                  <div>
                    <Label>Reference / TX ID</Label>
                    <Input value={ref} onChange={(e) => setRef(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
                  </div>
                  <Button
                    type="submit"
                    disabled={busy || !ref.trim()}
                    className="w-full rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90"
                  >
                    {busy ? "Submitting…" : "Submit payment details"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-display" : "text-muted-foreground"}`}>
      <span>{l}</span>
      <span className={bold ? "text-foreground" : ""}>{v}</span>
    </div>
  );
}
