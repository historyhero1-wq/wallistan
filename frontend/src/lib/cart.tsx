import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  productSlug: string;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  selectedOptions: Record<string, unknown>;
  customUploads: string[];
  woocommerceProductId?: number;
  woocommerceVariationId?: number;
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (index: number) => void;
  setQty: (index: number, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "signora_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const value = useMemo<CartCtx>(() => ({
    items,
    add: (item) => setItems((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.productSlug === item.productSlug &&
          p.woocommerceVariationId === item.woocommerceVariationId &&
          JSON.stringify(p.selectedOptions) === JSON.stringify(item.selectedOptions),
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    }),
    remove: (index) => setItems((prev) => prev.filter((_, i) => i !== index)),
    setQty: (index, qty) => setItems((prev) => prev.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, qty) } : it))),
    clear: () => setItems([]),
    subtotal: items.reduce((s, it) => s + it.unitPrice * it.quantity, 0),
    count: items.reduce((n, it) => n + it.quantity, 0),
  }), [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
