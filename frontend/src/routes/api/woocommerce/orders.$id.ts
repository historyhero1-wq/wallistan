import { createFileRoute } from "@tanstack/react-router";
import { getWooCommerceConfig } from "@/integrations/woocommerce/config";
import {
  orderEmailMatches,
  wooAddOrderNote,
  wooGetOrder,
} from "@/integrations/woocommerce/client.server";

export const Route = createFileRoute("/api/woocommerce/orders/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (!getWooCommerceConfig()) {
          return Response.json({ error: "WooCommerce not configured" }, { status: 503 });
        }

        const url = new URL(request.url);
        const email = url.searchParams.get("email")?.trim();
        if (!email) {
          return Response.json({ error: "Email is required" }, { status: 400 });
        }

        const orderId = Number(params.id);
        if (!Number.isFinite(orderId)) {
          return Response.json({ error: "Invalid order id" }, { status: 400 });
        }

        try {
          const order = await wooGetOrder(orderId);
          if (!orderEmailMatches(order, email)) {
            return Response.json({ error: "Order not found" }, { status: 404 });
          }
          return Response.json(order);
        } catch (error) {
          console.error(error);
          return Response.json({ error: "Order not found" }, { status: 404 });
        }
      },
      POST: async ({ params, request }) => {
        if (!getWooCommerceConfig()) {
          return Response.json({ error: "WooCommerce not configured" }, { status: 503 });
        }

        const orderId = Number(params.id);
        if (!Number.isFinite(orderId)) {
          return Response.json({ error: "Invalid order id" }, { status: 400 });
        }

        try {
          const body = (await request.json()) as {
            email?: string;
            method?: string;
            reference?: string;
            message?: string;
          };
          const email = body.email?.trim();
          if (!email) {
            return Response.json({ error: "Email is required" }, { status: 400 });
          }

          const order = await wooGetOrder(orderId);
          if (!orderEmailMatches(order, email)) {
            return Response.json({ error: "Order not found" }, { status: 404 });
          }

          const note = [
            "Payment proof submitted via Wallistan storefront",
            body.method ? `Method: ${body.method}` : "",
            body.reference ? `Reference: ${body.reference}` : "",
            body.message ?? "",
          ]
            .filter(Boolean)
            .join("\n");

          await wooAddOrderNote(orderId, note, true);
          return Response.json({ ok: true });
        } catch (error) {
          console.error(error);
          const message = error instanceof Error ? error.message : "Could not submit payment proof";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
