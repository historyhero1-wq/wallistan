import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { OptionField, Product } from "@/lib/catalog";
import { formatPKR, resolveVariation, whatsappLink } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, MessageCircle, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";


type Values = Record<string, string | File | null>;

function priceOfField(f: OptionField, val: string | File | null): number {
  if (val == null || val === "") return 0;
  if (f.type === "select" || f.type === "radio" || f.type === "color") {
    const found = f.options.find((o) => o.value === val);
    return found?.priceDelta ?? 0;
  }
  if (f.type === "text") return f.priceDelta ?? 0;
  return 0;
}

export function DynamicOptions({ product }: { product: Product }) {
  const nav = useNavigate();
  const { add } = useCart();
  const [values, setValues] = useState<Values>(() => {
    const v: Values = {};
    for (const f of product.options) {
      if ((f.type === "select" || f.type === "radio" || f.type === "color") && f.required) {
        v[f.id] = f.options[0]?.value ?? "";
      } else v[f.id] = "";
    }
    return v;
  });
  const [qty, setQty] = useState(1);

  const unitExtras = useMemo(
    () => (product.variations?.length ? 0 : product.options.reduce((sum, f) => sum + priceOfField(f, values[f.id] ?? null), 0)),
    [values, product],
  );
  const selectedPlain = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v == null || v === "") continue;
      out[k] = typeof v === "string" ? v : (v as File).name;
    }
    return out;
  }, [values]);
  const matchedVariation = useMemo(() => resolveVariation(product, selectedPlain), [product, selectedPlain]);
  const unitPrice = matchedVariation?.price ?? product.basePrice + unitExtras;
  const total = unitPrice * qty;

  function set(id: string, v: string | File | null) {
    setValues((prev) => ({ ...prev, [id]: v }));
  }

  function validate(): string | null {
    for (const f of product.options) {
      if ("required" in f && f.required) {
        const v = values[f.id];
        if (v == null || v === "") return `Please fill in "${f.label}"`;
      }
    }
    return null;
  }

  function selectedOptionsPlain() {
    return selectedPlain;
  }

  function buildCartItem() {
    const options = selectedOptionsPlain();
    const variation = resolveVariation(product, options);
    return {
      productSlug: product.slug,
      productName: product.name,
      imageUrl: variation?.image ?? product.images[0] ?? "",
      unitPrice,
      quantity: qty,
      selectedOptions: options,
      customUploads: [] as string[],
      woocommerceProductId: product.woocommerceId,
      woocommerceVariationId: variation?.id,
    };
  }

  function handleAdd() {
    const err = validate();
    if (err) return toast.error(err);
    if (product.variations?.length && !resolveVariation(product, selectedOptionsPlain())) {
      return toast.error("Please select all product options");
    }
    const item = buildCartItem();
    add(item);
    toast.success("Added to cart", { description: `${product.name} × ${qty} — ${formatPKR(total)}` });
  }

  function buyNow() {
    const err = validate();
    if (err) return toast.error(err);
    if (product.variations?.length && !resolveVariation(product, selectedOptionsPlain())) {
      return toast.error("Please select all product options");
    }
    add(buildCartItem());
    nav({ to: "/checkout" });
  }


  function whatsappMessage() {
    const lines = [`Hi Wallistan — I'm interested in the ${product.name}.`];
    for (const f of product.options) {
      const v = values[f.id];
      if (!v) continue;
      const label = typeof v === "string" ? v : (v as File).name;
      lines.push(`${f.label}: ${label}`);
    }
    lines.push(`Quantity: ${qty}`);
    lines.push(`Estimated total: ${formatPKR(total)}`);
    return lines.join("\n");
  }

  const displayPrice = matchedVariation?.price ?? product.basePrice + unitExtras;
  const displayCompareAt = matchedVariation?.regularPrice ?? product.compareAtPrice;

  return (
    <div className="space-y-6">
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        {displayCompareAt && displayCompareAt > displayPrice ? (
          <>
            <div className="text-xl text-muted-foreground line-through decoration-1">{formatPKR(displayCompareAt)}</div>
            <div className="font-display text-3xl text-red-600 font-bold">{formatPKR(displayPrice)}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-white ml-2">
              <span className="bg-zinc-800 px-2 py-1 rounded-sm tracking-wider">OFF</span>
              <span className="bg-zinc-800 px-2 py-1 rounded-sm">-{Math.round((1 - displayPrice / displayCompareAt) * 100)}%</span>
            </div>
          </>
        ) : (
          <div className="font-display text-3xl">{formatPKR(displayPrice)}</div>
        )}
      </div>

      <div className="mt-4 text-sm font-semibold text-foreground">
        Already {(product.woocommerceId ?? 0) % 15 + 5} Sold!
      </div>

      <div className="mt-4 mb-2">
        <div className="text-xs text-muted-foreground mb-1.5">{product.stock || 992} in stock</div>
        <div className="h-2 w-full bg-border/50 overflow-hidden">
           <div className="h-full bg-green-500" style={{ width: `${Math.max(10, Math.min(100, (product.stock || 992) / 10))}%` }} />
        </div>
      </div>

      {product.options.map((f) => (
        <div key={f.id}>
          <div className="mb-2 flex items-baseline justify-between">
            <Label className="text-sm font-medium">
              {f.label}
              {"required" in f && f.required && <span className="ml-1 text-[color:var(--color-gold)]">*</span>}
            </Label>
            {(f.type === "select" || f.type === "radio" || f.type === "color") && values[f.id] && (
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const opt = f.options.find((o) => o.value === values[f.id]);
                  return opt?.priceDelta ? `+ ${formatPKR(opt.priceDelta)}` : "included";
                })()}
              </span>
            )}
          </div>

          {f.type === "select" && (
            <Select value={(values[f.id] as string) || ""} onValueChange={(v) => set(f.id, v)}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose ${f.label.toLowerCase()}`}>
                  {(() => {
                    const chosen = f.options.find(o => o.value === values[f.id]);
                    if (!chosen) return `Choose ${f.label.toLowerCase()}`;
                    return (
                      <span className="flex items-center gap-2">
                        {chosen.swatch && (
                          <span className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-border/60 shadow-inner" style={{ background: chosen.swatch }} />
                        )}
                        {chosen.label}
                      </span>
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="flex items-center gap-2">
                      {o.swatch && (
                        <span className="inline-block h-3.5 w-3.5 flex-shrink-0 rounded-full border border-border/60 shadow-inner" style={{ background: o.swatch }} />
                      )}
                      {o.label}{o.priceDelta ? ` (+${formatPKR(o.priceDelta)})` : ""}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {f.type === "radio" && (
            <RadioGroup value={(values[f.id] as string) || ""} onValueChange={(v) => set(f.id, v)} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {f.options.map((o) => (
                <label key={o.value} className={cn(
                  "cursor-pointer rounded-md border border-border p-3 text-sm transition-colors",
                  values[f.id] === o.value ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5" : "hover:border-foreground/40"
                )}>
                  <RadioGroupItem value={o.value} className="sr-only" />
                  <div className="flex items-center gap-2">
                    {o.swatch && (
                      <span className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-border/60 shadow-inner" style={{ background: o.swatch }} />
                    )}
                    <span className="font-medium">{o.label}</span>
                  </div>
                  {o.priceDelta ? <div className="mt-0.5 text-xs text-muted-foreground">+ {formatPKR(o.priceDelta)}</div> : null}
                </label>
              ))}
            </RadioGroup>
          )}

          {f.type === "color" && (
            <div className="flex flex-wrap gap-2">
              {f.options.map((o) => {
                const active = values[f.id] === o.value;
                return (
                  <button key={o.value} type="button" onClick={() => set(f.id, o.value)}
                    className={cn("group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                      active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40")}
                    aria-pressed={active}>
                    <span className="h-4 w-4 rounded-full border border-border/60 shadow-inner" style={{ background: o.swatch || o.value.replace('warm-white', '#fdf4dc') }} />
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {f.type === "text" && (
            <Input
              maxLength={f.maxLength}
              placeholder={f.placeholder}
              value={(values[f.id] as string) || ""}
              onChange={(e) => set(f.id, e.target.value)}
            />
          )}

          {f.type === "textarea" && (
            <Textarea
              maxLength={f.maxLength}
              placeholder={f.placeholder}
              value={(values[f.id] as string) || ""}
              onChange={(e) => set(f.id, e.target.value)}
              rows={3}
            />
          )}

          {f.type === "file" && (
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-secondary/50 px-4 py-3 text-sm transition-colors hover:border-[color:var(--color-gold)]">
              <UploadCloud className="h-4 w-4 text-[color:var(--color-gold)]" />
              <span className="text-muted-foreground">
                {values[f.id] ? (values[f.id] as File).name : `Upload (${f.accept ?? "any file"})`}
              </span>
              <input
                type="file"
                accept={f.accept}
                className="hidden"
                onChange={(e) => set(f.id, e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      ))}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-md border border-border">
          <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
          <div className="w-10 text-center text-sm font-medium">{qty}</div>
          <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
          <div className="flex items-baseline justify-end gap-2">
            {displayCompareAt && displayCompareAt > displayPrice && (
              <span className="text-sm text-muted-foreground line-through decoration-1">
                {formatPKR(displayCompareAt * qty)}
              </span>
            )}
            <div className="font-display text-2xl text-foreground">{formatPKR(total)}</div>
          </div>
        </div>
      </div>

      <div id="buy" className="grid gap-2 sm:grid-cols-2 mb-2">
        <Button size="lg" onClick={handleAdd} variant="outline" className="rounded border-[color:var(--color-maroon)]/40">
          <ShoppingBag className="mr-2 h-4 w-4" /> Add to cart
        </Button>
        <Button size="lg" onClick={buyNow} className="rounded bg-[color:var(--color-gold)] text-[color:var(--color-gold-foreground)] hover:bg-[color:var(--color-gold)]/90">
          Buy now
        </Button>
      </div>
      <Button asChild size="lg" className="w-full rounded bg-[#0a4d42] hover:bg-[#083b32] text-white mb-4">
        <a href={whatsappLink(whatsappMessage())} target="_blank" rel="noreferrer">
          For bulk orders & special discounts, contact us on WhatsApp! <MessageCircle className="ml-2 h-4 w-4" />
        </a>
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
        <span>👁</span>
        <span><strong className="text-foreground">{product.woocommerceId % 30 + 45}</strong> people viewing this product right now!</span>
      </div>
    </div>
  );
}
