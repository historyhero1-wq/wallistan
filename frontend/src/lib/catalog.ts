// Catalog data adapter — products and categories from WooCommerce or the
// Wallistan custom PHP backend (whichever is configured).

import catNeon from "@/assets/cat-neon.jpg";
import catAcrylic from "@/assets/cat-acrylic.jpg";
import catShop from "@/assets/cat-shop.jpg";
import catDecor from "@/assets/cat-decor.jpg";
import { api } from "@/lib/api";

export type OptionField =
  | {
      id: string;
      type: "select" | "radio";
      label: string;
      required?: boolean;
      options: { value: string; label: string; swatch?: string; priceDelta?: number }[];
    }
  | {
      id: string;
      type: "text";
      label: string;
      required?: boolean;
      maxLength?: number;
      placeholder?: string;
      priceDelta?: number;
    }
  | {
      id: string;
      type: "textarea";
      label: string;
      required?: boolean;
      maxLength?: number;
      placeholder?: string;
    }
  | {
      id: string;
      type: "file";
      label: string;
      accept?: string;
      required?: boolean;
    }
  | {
      id: string;
      type: "color";
      label: string;
      required?: boolean;
      options: { value: string; label: string; swatch: string; priceDelta?: number }[];
    }
  | {
      id: string;
      type: "dimensions";
      label: string;
      required?: boolean;
      pricePerSqIn?: number;
    };

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  image: string;
}

export interface Review {
  author: string;
  city: string;
  rating: number;
  text: string;
}

export interface ProductVariation {
  id: number;
  price: number;
  regularPrice?: number;
  attributes: Record<string, string>;
  image?: string;
  inStock: boolean;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  categorySlug: string;
  basePrice: number;
  compareAtPrice?: number;
  currency: "PKR";
  images: string[];
  description: string;
  bullets: string[];
  faq: { q: string; a: string }[];
  reviews: Review[];
  rating: number;
  reviewCount: number;
  options: OptionField[];
  badges?: string[];
  bestSeller?: boolean;
  stock?: number;
  woocommerceId?: number;
  variations?: ProductVariation[];
}

const BLOG: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readMins: number;
  cover: string;
}[] = [
  {
    slug: "best-3d-wall-decor-ideas-2026",
    title: "Best 3D Wall Decor Ideas for 2026",
    excerpt: "From layered walnut mandalas to backlit metal letters — 12 focal-point ideas that transform any room.",
    content:
      "The best 3D wall decor pieces do three things at once: anchor the room, throw dimensional shadow, and read as considered rather than decorative. Here are twelve ideas we're building for clients across Pakistan this year — from a 1.2 m walnut sunburst above a linen sofa, to a slim brushed-brass monogram over a study desk. Pair matte plaster walls with warm-toned wood, or dark textured walls with polished metal. Lighting is half the effect: a single warm LED grazing the surface from above will double the perceived depth.",
    date: "2026-06-14",
    author: "Wallistan Studio",
    readMins: 6,
    cover: catDecor,
  },
  {
    slug: "how-to-choose-shop-signage",
    title: "How to Choose Shop Signage That Actually Converts",
    excerpt: "Six lessons from 400+ storefront installs — what pulls people in, and what quietly loses them.",
    content:
      "Great shop signage is a conversion tool, not a decoration. Legibility from 30 metres, contrast against your facade, and warm-white illumination at dusk are what turn window-shoppers into walk-ins. Skip fashionable script fonts unless your brand is a bakery or salon; sans-serif with generous tracking almost always outperforms them for retail. And always specify IP65 or better if your sign lives outdoors — Pakistan's monsoon is unforgiving.",
    date: "2026-05-22",
    author: "Wallistan Studio",
    readMins: 5,
    cover: catShop,
  },
  {
    slug: "led-sign-design-trends-2026",
    title: "LED Sign Design Trends for 2026",
    excerpt: "Muted neons, cut-to-shape acrylic, and why the 'infinity edge' is everywhere this year.",
    content:
      "Three trends dominated our custom LED orders this year: muted vintage neons (warm amber, dusty pink), cut-to-shape acrylic backboards that let the sign 'float', and infinity-edge halo-lit metal letters that throw a soft halo onto the wall behind them. All three feel expensive on a phone camera — which matters, because your sign will live on Instagram more than in real life.",
    date: "2026-04-08",
    author: "Wallistan Studio",
    readMins: 4,
    cover: catNeon,
  },
  {
    slug: "office-branding-ideas",
    title: "Office Branding Ideas That Feel Premium",
    excerpt: "Reception walls, meeting-room signage, and quiet ways to reinforce brand at every touchpoint.",
    content:
      "A logo above the reception desk is the obvious move — but the offices that feel the most premium extend the brand into meeting-room name plaques, corridor wayfinding, and even elevator lobbies. Keep the material palette tight: pick two (typically one warm metal + one wood or acrylic) and repeat them everywhere.",
    date: "2026-03-15",
    author: "Wallistan Studio",
    readMins: 5,
    cover: catAcrylic,
  },
];

async function fetchWoo<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path);
  } catch {
    return null;
  }
}

export function resolveVariation(product: Product, selectedOptions: Record<string, string>): ProductVariation | undefined {
  if (!product.variations?.length) return undefined;
  const entries = Object.entries(selectedOptions).filter(([, v]) => v);
  if (entries.length === 0) return undefined;
  return product.variations.find((variation) =>
    entries.every(([key, value]) => variation.attributes[key] === value),
  );
}

export async function listCategories(): Promise<Category[]> {
  // ── WooCommerce ──────────────────────────────────────────────────────────
  try {
    const { isWooCommerceEnabled } = await import("@/integrations/woocommerce/config");
    if (isWooCommerceEnabled()) {
      if (import.meta.env.SSR) {
        const { listCategoriesFromWoo } = await import("@/integrations/woocommerce/catalog.server");
        return await listCategoriesFromWoo();
      }
      const data = await fetchWoo<Category[]>("/api/woocommerce/categories");
      return data ?? [];
    }
  } catch (error) {
    console.error("[catalog] WooCommerce categories failed:", error);
  }

  // ── Wallistan PHP backend ────────────────────────────────────────────────
  try {
    const { isWallistanEnabled } = await import("@/integrations/wallistan/config");
    if (isWallistanEnabled()) {
      return await api.get<Category[]>("/categories");
    }
  } catch (error) {
    console.error("[catalog] Wallistan categories failed:", error);
  }

  return [];
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await listCategories();
  return categories.find((c) => c.slug === slug);
}

export async function listProducts(): Promise<Product[]> {
  // ── WooCommerce ──────────────────────────────────────────────────────────
  try {
    const { isWooCommerceEnabled } = await import("@/integrations/woocommerce/config");
    if (isWooCommerceEnabled()) {
      if (import.meta.env.SSR) {
        const { listProductsFromWoo } = await import("@/integrations/woocommerce/catalog.server");
        return await listProductsFromWoo();
      }
      const data = await fetchWoo<Product[]>("/api/woocommerce/products");
      return data ?? [];
    }
  } catch (error) {
    console.error("[catalog] WooCommerce products failed:", error);
  }

  // ── Wallistan PHP backend ────────────────────────────────────────────────
  try {
    const { isWallistanEnabled } = await import("@/integrations/wallistan/config");
    if (isWallistanEnabled()) {
      return await api.get<Product[]>('/products');
    }
  } catch (error) {
    console.error("[catalog] Wallistan products failed:", error);
  }

  return [];
}

export async function listProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await listProducts();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  // ── WooCommerce ──────────────────────────────────────────────────────────
  try {
    const { isWooCommerceEnabled } = await import("@/integrations/woocommerce/config");
    if (isWooCommerceEnabled()) {
      if (import.meta.env.SSR) {
        const { getProductFromWoo } = await import("@/integrations/woocommerce/catalog.server");
        return await getProductFromWoo(slug);
      }
      const product = await fetchWoo<Product>(`/api/woocommerce/product/${encodeURIComponent(slug)}`);
      return product ?? undefined;
    }
  } catch (error) {
    console.error("[catalog] WooCommerce product failed:", error);
  }

  // ── Wallistan PHP backend ────────────────────────────────────────────────
  try {
    const { isWallistanEnabled } = await import("@/integrations/wallistan/config");
    if (isWallistanEnabled()) {
      return await api.get<Product>(`/products/${encodeURIComponent(slug)}`);
    }
  } catch (error) {
    console.error("[catalog] Wallistan product failed:", error);
  }

  return undefined;
}

export async function bestSellers(limit = 4): Promise<Product[]> {
  const products = await listProducts();
  const featured = products.filter((p) => p.bestSeller);
  return (featured.length ? featured : products).slice(0, limit);
}

export async function relatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const products = await listProducts();
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.categorySlug === current.categorySlug)
    .concat(products.filter((p) => p.slug !== slug && p.categorySlug !== current.categorySlug))
    .slice(0, limit);
}

export async function listBlog() {
  return BLOG;
}

export async function getBlog(slug: string) {
  return BLOG.find((b) => b.slug === slug);
}

export function formatPKR(n: number): string {
  return "PKR " + new Intl.NumberFormat("en-PK").format(Math.round(n));
}

export const BRAND = {
  name: "Wallistan",
  tagline: "Premium 3D Signs & Custom Wall Decor",
  logo: "/wallistan_logo.png",
  phone: "+92 318 1328872",
  whatsapp: "923181328872",
  email: "shahzadadvertisingagency@gmail.com",
  city: "Multan, Pakistan",
  address: "Multan, Punjab, Pakistan",
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}
