import type { CartItem } from "@/lib/cart";
import { wooCreateOrder } from "./client.server";
import type { WooCreateOrderPayload, WooOrderLineItem } from "./types";

export type PlaceWooOrderInput = {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  shippingAddress: string;
  shippingCity: string;
  notes?: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  items: CartItem[];
};

const PAYMENT_METHODS: Record<string, { id: string; title: string; paid: boolean; status: string }> = {
  cod: { id: "cod", title: "Cash on Delivery", paid: false, status: "processing" },
  bank_transfer: { id: "bacs", title: "Bank Transfer", paid: false, status: "on-hold" },
  jazzcash: { id: "other", title: "JazzCash", paid: false, status: "on-hold" },
  easypaisa: { id: "other", title: "Easypaisa", paid: false, status: "on-hold" },
};

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "-" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function toLineItems(items: CartItem[]): WooOrderLineItem[] {
  return items.map((item) => {
    const meta = Object.entries(item.selectedOptions).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    const line: WooOrderLineItem = {
      product_id: item.woocommerceProductId!,
      quantity: item.quantity,
      meta_data: meta.length ? meta : undefined,
    };
    if (item.woocommerceVariationId) line.variation_id = item.woocommerceVariationId;
    return line;
  });
}

export async function createWooCommerceOrder(input: PlaceWooOrderInput) {
  const payment = PAYMENT_METHODS[input.paymentMethod] ?? PAYMENT_METHODS.cod;
  const { first, last } = splitName(input.contactName);

  const payload: WooCreateOrderPayload = {
    payment_method: payment.id,
    payment_method_title: payment.title,
    set_paid: payment.paid,
    status: payment.status,
    billing: {
      first_name: first,
      last_name: last,
      address_1: input.shippingAddress,
      city: input.shippingCity,
      email: input.contactEmail,
      phone: input.contactPhone,
      country: "PK",
    },
    shipping: {
      first_name: first,
      last_name: last,
      address_1: input.shippingAddress,
      city: input.shippingCity,
      country: "PK",
    },
    line_items: toLineItems(input.items),
    customer_note: input.notes,
    coupon_lines: input.couponCode ? [{ code: input.couponCode }] : undefined,
    shipping_lines:
      input.shippingFee > 0
        ? [{ method_id: "flat_rate", method_title: "Shipping", total: String(input.shippingFee) }]
        : undefined,
  };

  return wooCreateOrder(payload);
}
