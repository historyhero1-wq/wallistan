import { createFileRoute } from "@tanstack/react-router";
import { getWallistanConfig } from "@/integrations/wallistan/config";
import { findOrderByNumberFromPhp } from "@/integrations/wallistan/orders.server";

export const Route = createFileRoute("/api/wallistan/orders/lookup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!getWallistanConfig()) {
          return Response.json({ error: "Wallistan backend not configured" }, { status: 503 });
        }

        const url = new URL(request.url);
        const number = url.searchParams.get("number")?.trim();
        const email = url.searchParams.get("email")?.trim();

        if (!number || !email) {
          return Response.json(
            { error: "Order number and email are required" },
            { status: 400 },
          );
        }

        try {
          const order = await findOrderByNumberFromPhp(number, email);
          if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
          return Response.json(order);
        } catch (error) {
          console.error("[GET /api/wallistan/orders/lookup]", error);
          return Response.json({ error: "Order not found" }, { status: 404 });
        }
      },
    },
  },
});
