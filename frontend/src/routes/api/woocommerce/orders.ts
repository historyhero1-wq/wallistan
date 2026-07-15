import { createFileRoute } from "@tanstack/react-router";
import { getWooCommerceConfig } from "@/integrations/woocommerce/config";
import { placeOrderWithWooCommerce } from "@/integrations/woocommerce/checkout.server";
import type { PlaceWooOrderInput } from "@/integrations/woocommerce/orders.server";

export const Route = createFileRoute("/api/woocommerce/orders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!getWooCommerceConfig()) {
          return Response.json({ error: "WooCommerce not configured" }, { status: 503 });
        }

        try {
          const body = (await request.json()) as PlaceWooOrderInput;
          const result = await placeOrderWithWooCommerce(body);
          return Response.json(result);
        } catch (error) {
          console.error(error);
          const message = error instanceof Error ? error.message : "Could not place order";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
