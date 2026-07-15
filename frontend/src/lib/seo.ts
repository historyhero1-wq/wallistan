// Centralised SEO helpers for canonical, og:url and og:image.
// Every leaf route pulls BASE_URL + absUrl() from here so we never
// ship relative URLs to crawlers (Google/Facebook require absolute).

import ogCoverImg from "@/assets/og-cover.jpg";

export const BASE_URL = import.meta.env.VITE_SITE_URL || "https://wallistan.pk";

/** Prefix any path with the canonical BASE_URL. */
export function absUrl(path: string): string {
  if (!path) return BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Default social share image (1200×630). Used when a route has none of its own. */
export const OG_IMAGE = absUrl(ogCoverImg);
