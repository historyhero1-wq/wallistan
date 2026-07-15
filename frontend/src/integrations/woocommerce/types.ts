export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string } | null;
  parent: number;
}

export interface WooAttribute {
  id: number;
  name: string;
  slug: string;
  variation: boolean;
  options: string[];
}

export interface WooVariationAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  regular_price: string;
  sale_price: string;
  price: string;
  images: { src: string }[];
  categories: { id: number; name: string; slug: string }[];
  attributes: WooAttribute[];
  stock_quantity: number | null;
  stock_status: string;
  average_rating: string;
  rating_count: number;
  featured?: boolean;
  on_sale?: boolean;
  meta_data?: { key: string; value: unknown }[];
}

export interface WooVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  image: { src: string } | null;
  attributes: WooVariationAttribute[];
  stock_quantity: number | null;
  stock_status: string;
}

export interface WooOrderLineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  meta_data?: { key: string; value: string }[];
}

export interface WooCreateOrderPayload {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  status: string;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    email: string;
    phone: string;
    country: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    country: string;
  };
  line_items: WooOrderLineItem[];
  customer_note?: string;
  coupon_lines?: { code: string }[];
  shipping_lines?: { method_id: string; method_title: string; total: string }[];
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
}

export interface WooOrderLineItemDetail {
  id: number;
  name: string;
  quantity: number;
  total: string;
  subtotal: string;
  price: number;
  image?: { src: string };
}

export interface WooOrderDetail extends WooOrder {
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
  line_items: WooOrderLineItemDetail[];
  customer_note: string;
}
