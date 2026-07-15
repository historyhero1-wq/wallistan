import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface WishlistCtx {
  slugs: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
}

const Ctx = createContext<WishlistCtx | null>(null);
const KEY = "signora_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) setSlugs(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(slugs)); } catch {}
  }, [slugs, ready]);

  const value = useMemo<WishlistCtx>(() => ({
    slugs,
    has: (s) => slugs.includes(s),
    toggle: (s) => setSlugs((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s])),
    remove: (s) => setSlugs((p) => p.filter((x) => x !== s)),
    clear: () => setSlugs([]),
    count: slugs.length,
  }), [slugs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
}
