import { createFileRoute } from "@tanstack/react-router";
import { listProductsFromPhp } from "@/integrations/wallistan/catalog.server";
import { getWallistanConfig } from "@/integrations/wallistan/config";

export const Route = createFileRoute("/api/wallistan/products")({
  server: {
    handlers: {
      GET: async () => {
        if (!getWallistanConfig()) {
          return Response.json({ error: "Wallistan backend not configured" }, { status: 503 });
        }
        try {
          const products = await listProductsFromPhp();
          return Response.json(products);
        } catch (error) {
          console.error("[/api/wallistan/products]", error);
          return Response.json({ error: "Failed to load products" }, { status: 500 });
        }
      },
    },
  },
});
