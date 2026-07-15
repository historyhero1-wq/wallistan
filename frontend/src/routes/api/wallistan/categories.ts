import { createFileRoute } from "@tanstack/react-router";
import { listCategoriesFromPhp } from "@/integrations/wallistan/catalog.server";
import { getWallistanConfig } from "@/integrations/wallistan/config";

export const Route = createFileRoute("/api/wallistan/categories")({
  server: {
    handlers: {
      GET: async () => {
        if (!getWallistanConfig()) {
          return Response.json({ error: "Wallistan backend not configured" }, { status: 503 });
        }
        try {
          const categories = await listCategoriesFromPhp();
          return Response.json(categories);
        } catch (error) {
          console.error("[/api/wallistan/categories]", error);
          return Response.json({ error: "Failed to load categories" }, { status: 500 });
        }
      },
    },
  },
});
