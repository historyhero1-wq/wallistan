/**
 * Catalog helpers that call the Wallistan PHP backend.
 * The PHP ProductMapper already outputs data in the same shape as the
 * frontend's Category / Product interfaces, so no mapping is needed.
 */
import type { Category, Product } from "@/lib/catalog";
import {
  phpListCategories,
  phpListProducts,
  phpGetProductBySlug,
} from "./client.server";

export async function listCategoriesFromPhp(): Promise<Category[]> {
  const cats = await phpListCategories();
  // PHP already returns {slug, name, tagline, image} — matches Category exactly
  return cats as Category[];
}

export async function listProductsFromPhp(): Promise<Product[]> {
  // PHP ProductMapper already returns the full Product shape
  return phpListProducts();
}

export async function getProductFromPhp(slug: string): Promise<Product | undefined> {
  const product = await phpGetProductBySlug(slug);
  return product ?? undefined;
}

export async function listProductsByCategoryFromPhp(categorySlug: string): Promise<Product[]> {
  const products = await listProductsFromPhp();
  return products.filter((p) => p.categorySlug === categorySlug);
}

export async function bestSellersFromPhp(limit = 8): Promise<Product[]> {
  const products = await listProductsFromPhp();
  const featured = products.filter((p) => p.bestSeller);
  return (featured.length ? featured : products).slice(0, limit);
}

export async function relatedProductsFromPhp(slug: string, limit = 4): Promise<Product[]> {
  const products = await listProductsFromPhp();
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.categorySlug === current.categorySlug)
    .concat(products.filter((p) => p.slug !== slug && p.categorySlug !== current.categorySlug))
    .slice(0, limit);
}
