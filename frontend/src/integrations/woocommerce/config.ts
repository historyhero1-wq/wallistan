export type WooCommerceConfig = {
  url: string;
  consumerKey: string;
  consumerSecret: string;
};

export function getWooCommerceConfig(): WooCommerceConfig | null {
  const url = process.env.WOOCOMMERCE_URL?.trim();
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();
  if (!url || !consumerKey || !consumerSecret) return null;
  return { url: url.replace(/\/$/, ""), consumerKey, consumerSecret };
}

/** Server: full credentials present. Client: build-time flag only. */
export function isWooCommerceEnabled(): boolean {
  if (typeof window === "undefined") return getWooCommerceConfig() !== null;
  return import.meta.env.VITE_WOOCOMMERCE_ENABLED === "true";
}
