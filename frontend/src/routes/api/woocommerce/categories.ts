import { createFileRoute } from "@tanstack/react-router";
import { listCategoriesFromWoo } from "@/integrations/woocommerce/catalog.server";
import { getWooCommerceConfig } from "@/integrations/woocommerce/config";

export const Route = createFileRoute("/api/woocommerce/categories")({
  server: {
    handlers: {
      GET: async () => {
        if (!getWooCommerceConfig()) {
          return Response.json({ error: "WooCommerce not configured" }, { status: 503 });
        }
        try {
          const categories = await listCategoriesFromWoo();
          return Response.json(categories);
        } catch (error) {
          console.error(error);
          return Response.json({ error: "Failed to load categories" }, { status: 500 });
        }
      },
    },
  },
});
