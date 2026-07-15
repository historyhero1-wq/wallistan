import type { Category, Product } from "@/lib/catalog";
import {
  wooGetProductBySlug,
  wooListCategories,
  wooListProducts,
  wooListVariations,
} from "./client.server";
import { mapWooCategory, mapWooProduct } from "./map";

export async function listCategoriesFromWoo(): Promise<Category[]> {
  const categories = await wooListCategories();
  return categories
    .filter((c) => c.slug !== "uncategorized")
    .map(mapWooCategory);
}

export async function listProductsFromWoo(): Promise<Product[]> {
  const products = await wooListProducts();
  const mapped = await Promise.all(
    products.map(async (product) => {
      if (product.type !== "variable") return mapWooProduct(product);
      const variations = await wooListVariations(product.id);
      return mapWooProduct(product, variations);
    }),
  );
  return mapped;
}

export async function getProductFromWoo(slug: string): Promise<Product | undefined> {
  const product = await wooGetProductBySlug(slug);
  if (!product) return undefined;
  const variations = product.type === "variable" ? await wooListVariations(product.id) : [];
  return mapWooProduct(product, variations);
}

export async function listProductsByCategoryFromWoo(categorySlug: string): Promise<Product[]> {
  const products = await listProductsFromWoo();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function bestSellersFromWoo(limit = 8): Promise<Product[]> {
  const products = await listProductsFromWoo();
  const featured = products.filter((p) => p.bestSeller);
  return (featured.length ? featured : products).slice(0, limit);
}

export async function relatedProductsFromWoo(slug: string, limit = 4): Promise<Product[]> {
  const products = await listProductsFromWoo();
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.categorySlug === current.categorySlug)
    .concat(products.filter((p) => p.slug !== slug && p.categorySlug !== current.categorySlug))
    .slice(0, limit);
}
