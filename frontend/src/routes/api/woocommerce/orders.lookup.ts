import { createFileRoute } from "@tanstack/react-router";
import { getWooCommerceConfig } from "@/integrations/woocommerce/config";
import { wooFindOrderByNumber } from "@/integrations/woocommerce/client.server";

export const Route = createFileRoute("/api/woocommerce/orders/lookup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!getWooCommerceConfig()) {
          return Response.json({ error: "WooCommerce not configured" }, { status: 503 });
        }

        const url = new URL(request.url);
        const number = url.searchParams.get("number")?.trim();
        const email = url.searchParams.get("email")?.trim();
        if (!number || !email) {
          return Response.json({ error: "Order number and email are required" }, { status: 400 });
        }

        try {
          const order = await wooFindOrderByNumber(number, email);
          if (!order) {
            return Response.json({ error: "Order not found" }, { status: 404 });
          }
          return Response.json(order);
        } catch (error) {
          console.error(error);
          return Response.json({ error: "Order not found" }, { status: 404 });
        }
      },
    },
  },
});
