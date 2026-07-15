import { createFileRoute } from "@tanstack/react-router";
import { getWallistanConfig } from "@/integrations/wallistan/config";
import { placeOrderWithPhp } from "@/integrations/wallistan/orders.server";
import type { PlacePhpOrderInput } from "@/integrations/wallistan/orders.server";

export const Route = createFileRoute("/api/wallistan/orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!getWallistanConfig()) {
          return Response.json({ error: "Wallistan backend not configured" }, { status: 503 });
        }
        try {
          const body = (await request.json()) as PlacePhpOrderInput;
          const result = await placeOrderWithPhp(body);
          return Response.json(result);
        } catch (error) {
          console.error("[POST /api/wallistan/orders]", error);
          const message = error instanceof Error ? error.message : "Could not place order";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
