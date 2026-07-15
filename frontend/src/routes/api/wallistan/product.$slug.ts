import { createFileRoute } from "@tanstack/react-router";
import { getProductFromPhp } from "@/integrations/wallistan/catalog.server";
import { getWallistanConfig } from "@/integrations/wallistan/config";

export const Route = createFileRoute("/api/wallistan/product/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!getWallistanConfig()) {
          return Response.json({ error: "Wallistan backend not configured" }, { status: 503 });
        }
        try {
          const product = await getProductFromPhp(params.slug);
          if (!product) return Response.json({ error: "Not found" }, { status: 404 });
          return Response.json(product);
        } catch (error) {
          console.error("[/api/wallistan/product/$slug]", error);
          return Response.json({ error: "Failed to load product" }, { status: 500 });
        }
      },
    },
  },
});
