import { createFileRoute } from "@tanstack/react-router";
import { getProductFromWoo } from "@/integrations/woocommerce/catalog.server";
import { getWooCommerceConfig } from "@/integrations/woocommerce/config";

export const Route = createFileRoute("/api/woocommerce/product/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!getWooCommerceConfig()) {
          return Response.json({ error: "WooCommerce not configured" }, { status: 503 });
        }
        try {
          const product = await getProductFromWoo(params.slug);
          if (!product) return Response.json({ error: "Not found" }, { status: 404 });
          return Response.json(product);
        } catch (error) {
          console.error(error);
          return Response.json({ error: "Failed to load product" }, { status: 500 });
        }
      },
    },
  },
});
