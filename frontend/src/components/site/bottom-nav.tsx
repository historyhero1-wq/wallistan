import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (path: string) => boolean;
};

const items: Item[] = [
  { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { to: "/shop", label: "Shop", icon: LayoutGrid, match: (p) => p.startsWith("/shop") || p.startsWith("/category") },
  { to: "/cart", label: "Cart", icon: ShoppingBag, match: (p) => p.startsWith("/cart") || p.startsWith("/checkout") },
  { to: "/orders", label: "Orders", icon: User, match: (p) => p.startsWith("/orders") || p.startsWith("/wishlist") },
];

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid h-16 grid-cols-4">
        {items.map((it) => {
          const active = it.match(path);
          const Icon = it.icon;
          const showBadge = it.to === "/cart" && count > 0;
          return (
            <li key={it.to} className="flex">
              <Link
                to={it.to}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active
                    ? "text-[color:var(--color-maroon)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative">
                  <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--color-gold)] px-1 text-[10px] font-semibold text-[color:var(--color-gold-foreground)]">
                      {count}
                    </span>
                  )}
                </span>
                <span>{it.label}</span>
                {active && (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-[color:var(--color-maroon)]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
