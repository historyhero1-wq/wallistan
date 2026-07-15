/**
 * Server-only HTTP client for the Wallistan PHP backend.
 * All functions in this file must only be called from server-side code
 * (SSR, API routes, *.server.ts files).
 */
import { getWallistanConfig } from "./config";
import type { Category, Product } from "@/lib/catalog";

// ─── Raw PHP API response shapes ─────────────────────────────────────────────

export interface PhpCategory {
  slug: string;
  name: string;
  tagline: string;
  image: string;
}

// PHP already maps products to the exact same shape as the frontend's Product
// type (via ProductMapper.php), so we reuse it directly.
export type PhpProduct = Product;

export interface PhpOrderResult {
  orderId: number;
  orderNumber: string;
  email: string;
}

export interface PhpOrderDetail {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  discount_total: string;
  shipping_total: string;
  payment_method_title: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
  };
  shipping: {
    address_1: string;
    city: string;
  };
  line_items: {
    id: number;
    name: string;
    quantity: number;
    total: string;
    subtotal: string;
    price: number;
    image?: { src: string };
  }[];
  customer_note: string;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function wallistanFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const config = getWallistanConfig();
  if (!config) throw new Error("Wallistan backend is not configured (STORE_API_URL missing)");

  const url = `${config.apiUrl}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Wallistan API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export async function phpListCategories(): Promise<PhpCategory[]> {
  return wallistanFetch<PhpCategory[]>("/categories");
}

export async function phpListProducts(): Promise<PhpProduct[]> {
  return wallistanFetch<PhpProduct[]>("/products");
}

export async function phpGetProductBySlug(slug: string): Promise<PhpProduct | null> {
  try {
    return await wallistanFetch<PhpProduct>(`/products/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function phpCreateOrder(body: Record<string, unknown>): Promise<PhpOrderResult> {
  return wallistanFetch<PhpOrderResult>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function phpGetOrderById(id: number, email: string): Promise<PhpOrderDetail | null> {
  try {
    return await wallistanFetch<PhpOrderDetail>(
      `/orders/${id}?email=${encodeURIComponent(email)}`,
    );
  } catch {
    return null;
  }
}

export async function phpFindOrderByNumber(
  number: string,
  email: string,
): Promise<PhpOrderDetail | null> {
  try {
    return await wallistanFetch<PhpOrderDetail>(
      `/orders/lookup?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email)}`,
    );
  } catch {
    return null;
  }
}

export async function phpAddPaymentNote(
  orderId: number,
  body: Record<string, string>,
): Promise<boolean> {
  try {
    await wallistanFetch(`/orders/${orderId}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return true;
  } catch {
    return false;
  }
}
