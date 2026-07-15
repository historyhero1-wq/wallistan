import { getWooCommerceConfig } from "./config";
import type {
  WooCategory,
  WooCreateOrderPayload,
  WooOrder,
  WooOrderDetail,
  WooProduct,
  WooVariation,
} from "./types";

function basicAuth(key: string, secret: string): string {
  const raw = `${key}:${secret}`;
  if (typeof Buffer !== "undefined") return Buffer.from(raw).toString("base64");
  return btoa(raw);
}

async function wooFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getWooCommerceConfig();
  if (!config) throw new Error("WooCommerce is not configured");

  const url = `${config.url}/wp-json/wc/v3${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Basic ${basicAuth(config.consumerKey, config.consumerSecret)}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WooCommerce API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function wooListCategories(): Promise<WooCategory[]> {
  return wooFetch<WooCategory[]>("/products/categories?per_page=100&hide_empty=true");
}

export async function wooListProducts(): Promise<WooProduct[]> {
  return wooFetch<WooProduct[]>("/products?per_page=100&status=publish");
}

export async function wooGetProductBySlug(slug: string): Promise<WooProduct | null> {
  const items = await wooFetch<WooProduct[]>(`/products?slug=${encodeURIComponent(slug)}&status=publish`);
  return items[0] ?? null;
}

export async function wooListVariations(productId: number): Promise<WooVariation[]> {
  return wooFetch<WooVariation[]>(`/products/${productId}/variations?per_page=100`);
}

export async function wooCreateOrder(payload: WooCreateOrderPayload): Promise<WooOrder> {
  return wooFetch<WooOrder>("/orders", { method: "POST", body: JSON.stringify(payload) });
}

export async function wooGetOrder(id: number): Promise<WooOrderDetail> {
  return wooFetch<WooOrderDetail>(`/orders/${id}`);
}

export async function wooFindOrderByNumber(number: string, email: string): Promise<WooOrderDetail | null> {
  const orders = await wooFetch<WooOrderDetail[]>(
    `/orders?search=${encodeURIComponent(number)}&per_page=10`,
  );
  const normalizedEmail = email.trim().toLowerCase();
  return (
    orders.find(
      (o) => o.number === number && o.billing.email.trim().toLowerCase() === normalizedEmail,
    ) ?? null
  );
}

export function orderEmailMatches(order: WooOrderDetail, email: string): boolean {
  return order.billing.email.trim().toLowerCase() === email.trim().toLowerCase();
}

export async function wooAddOrderNote(orderId: number, note: string, customerNote = false): Promise<void> {
  await wooFetch(`/orders/${orderId}/notes`, {
    method: "POST",
    body: JSON.stringify({ note, customer_note: customerNote }),
  });
}
