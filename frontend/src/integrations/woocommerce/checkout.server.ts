import type { CartItem } from "@/lib/cart";
import { createWooCommerceOrder, type PlaceWooOrderInput } from "./orders.server";

export type CheckoutOrderResult = {
  orderId: number;
  orderNumber: string;
  email: string;
};

export async function placeOrderWithWooCommerce(input: PlaceWooOrderInput): Promise<CheckoutOrderResult> {
  if (!input.items.every((it) => it.woocommerceProductId)) {
    throw new Error("Cart items must be linked to WooCommerce products");
  }

  const wcOrder = await createWooCommerceOrder(input);
  return {
    orderId: wcOrder.id,
    orderNumber: wcOrder.number,
    email: input.contactEmail,
  };
}
