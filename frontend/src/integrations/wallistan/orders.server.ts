/**
 * Order helpers that call the Wallistan PHP backend.
 */
import type { CartItem } from "@/lib/cart";
import { phpCreateOrder, phpGetOrderById, phpFindOrderByNumber, phpAddPaymentNote } from "./client.server";
import type { PhpOrderDetail } from "./client.server";

export type { PhpOrderDetail };

export type PlacePhpOrderInput = {
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

export type PhpCheckoutResult = {
  orderId: number;
  orderNumber: string;
  email: string;
};

export async function placeOrderWithPhp(input: PlacePhpOrderInput): Promise<PhpCheckoutResult> {
  const result = await phpCreateOrder({
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    contactEmail: input.contactEmail,
    shippingAddress: input.shippingAddress,
    shippingCity: input.shippingCity,
    notes: input.notes,
    paymentMethod: input.paymentMethod,
    subtotal: input.subtotal,
    discount: input.discount,
    shippingFee: input.shippingFee,
    total: input.total,
    couponCode: input.couponCode,
    items: input.items,
  });

  return {
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    email: result.email,
  };
}

export async function getOrderFromPhp(id: number, email: string): Promise<PhpOrderDetail | null> {
  return phpGetOrderById(id, email);
}

export async function findOrderByNumberFromPhp(
  number: string,
  email: string,
): Promise<PhpOrderDetail | null> {
  return phpFindOrderByNumber(number, email);
}

export async function addPaymentNoteToPhpOrder(
  orderId: number,
  body: Record<string, string>,
): Promise<boolean> {
  return phpAddPaymentNote(orderId, body);
}
