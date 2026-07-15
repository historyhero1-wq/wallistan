import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { listProducts, listCategories, formatPKR } from "@/lib/catalog";

interface SearchCtx { open: boolean; setOpen: (o: boolean) => void; openSearch: () => void; }
const Ctx = createContext<SearchCtx | null>(null);

export function SearchDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen, openSearch: () => setOpen(true) }), [open]);

  // Global keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <GlobalSearch />
    </Ctx.Provider>
  );
}

export function useSearchDialog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearchDialog must be inside SearchDialogProvider");
  return ctx;
}

function GlobalSearch() {
  const { open, setOpen } = useSearchDialog();
  const nav = useNavigate();
  const { data: products = [] } = useQuery({ queryKey: ["all-products"], queryFn: () => listProducts() });
  const { data: cats = [] } = useQuery({ queryKey: ["all-cats"], queryFn: () => listCategories() });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search products, categories…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {products.length > 0 && (
          <CommandGroup heading="Products">
            {products.map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.name} ${p.tagline}`}
                onSelect={() => { nav({ to: "/product/$slug", params: { slug: p.slug } }); setOpen(false); }}
              >
                <div className="flex w-full items-center gap-3">
                  <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{p.name}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatPKR(p.basePrice)}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {cats.length > 0 && (
          <CommandGroup heading="Categories">
            {cats.map((c) => (
              <CommandItem
                key={c.slug}
                value={c.name}
                onSelect={() => { nav({ to: "/category/$slug", params: { slug: c.slug } }); setOpen(false); }}
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
