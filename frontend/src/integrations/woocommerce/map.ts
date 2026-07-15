import type { Category, OptionField, Product, ProductVariation } from "@/lib/catalog";
import type { WooCategory, WooProduct, WooVariation } from "./types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(value: string | undefined): number {
  const n = Number.parseFloat(value ?? "0");
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function mapWooCategory(category: WooCategory): Category {
  return {
    slug: category.slug,
    name: category.name,
    tagline: stripHtml(category.description).slice(0, 120) || category.name,
    image: category.image?.src ?? "/wallistan_logo.png",
  };
}

function mapVariationAttributes(variation: WooVariation): Record<string, string> {
  const out: Record<string, string> = {};
  for (const attr of variation.attributes) {
    if (!attr.option) continue;
    out[slugify(attr.name)] = slugify(attr.option) || attr.option.toLowerCase();
  }
  return out;
}

export function mapWooVariation(variation: WooVariation): ProductVariation {
  const price = parsePrice(variation.sale_price || variation.price || variation.regular_price);
  const regularPrice = parsePrice(variation.regular_price);
  return {
    id: variation.id,
    price,
    regularPrice: regularPrice > price ? regularPrice : undefined,
    attributes: mapVariationAttributes(variation),
    image: variation.image?.src,
    inStock: variation.stock_status !== "outofstock",
  };
}

function mapVariableOptions(product: WooProduct, variations: WooVariation[]): OptionField[] {
  const options: OptionField[] = [];
  for (const attr of product.attributes) {
    if (!attr.variation || attr.options.length === 0) continue;
    options.push({
      id: slugify(attr.name),
      type: attr.options.length <= 4 ? "radio" : "select",
      label: attr.name,
      required: true,
      options: attr.options.map((option) => ({
        value: slugify(option) || option.toLowerCase(),
        label: option,
      })),
    });
  }
  return options;
}

function mapMetaBullets(product: WooProduct): string[] {
  const bullets = product.meta_data?.find((m) => m.key === "bullets" || m.key === "_bullets");
  if (Array.isArray(bullets?.value)) return bullets.value.map(String);
  return [];
}

export function mapWooProduct(product: WooProduct, variations: WooVariation[] = []): Product {
  const mappedVariations = variations.map(mapWooVariation);
  const basePrice = mappedVariations.length
    ? Math.min(...mappedVariations.map((v) => v.price))
    : parsePrice(product.sale_price || product.price || product.regular_price);
  const regularPrice = parsePrice(product.regular_price);
  const compareAt = regularPrice > basePrice ? regularPrice : undefined;

  return {
    slug: product.slug,
    name: product.name,
    tagline: stripHtml(product.short_description) || product.name,
    categorySlug: product.categories[0]?.slug ?? "uncategorized",
    basePrice,
    compareAtPrice: compareAt,
    currency: "PKR",
    images: product.images.map((img) => img.src).filter(Boolean),
    description: stripHtml(product.description) || stripHtml(product.short_description),
    bullets: mapMetaBullets(product),
    faq: [],
    reviews: [],
    rating: Number.parseFloat(product.average_rating) || 0,
    reviewCount: product.rating_count ?? 0,
    options: product.type === "variable" ? mapVariableOptions(product, variations) : [],
    badges: product.on_sale ? ["Sale"] : undefined,
    bestSeller: product.featured === true,
    stock: product.stock_quantity ?? (product.stock_status === "instock" ? 99 : 0),
    woocommerceId: product.id,
    variations: mappedVariations.length ? mappedVariations : undefined,
  };
}
