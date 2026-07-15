import { createFileRoute } from "@tanstack/react-router";
import { listProductsFromWoo } from "@/integrations/woocommerce/catalog.server";
import { getWooCommerceConfig } from "@/integrations/woocommerce/config";

export const Route = createFileRoute("/api/woocommerce/products")({
  server: {
    handlers: {
      GET: async () => {
        if (!getWooCommerceConfig()) {
          return Response.json({ error: "WooCommerce not configured" }, { status: 503 });
        }
        try {
          const products = await listProductsFromWoo();
          return Response.json(products);
        } catch (error) {
          console.error(error);
          return Response.json({ error: "Failed to load products" }, { status: 500 });
        }
      },
    },
  },
});
