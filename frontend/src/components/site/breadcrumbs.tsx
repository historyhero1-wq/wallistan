import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  name: string;
  /** Leave undefined for the current page. */
  href?: string;
}

/** Visible breadcrumb trail. Pair with breadcrumbJsonLd() below for schema. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />}
              {c.href && !last ? (
                <Link to={c.href} className="hover:text-foreground">{c.name}</Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-foreground">{c.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** BreadcrumbList JSON-LD payload matching the visible trail. */
export function breadcrumbJsonLd(items: Crumb[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.href ? (c.href.startsWith("http") ? c.href : `${baseUrl}${c.href}`) : undefined,
    })),
  };
}
