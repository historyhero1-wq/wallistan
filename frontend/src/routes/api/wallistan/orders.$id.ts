import { createFileRoute } from "@tanstack/react-router";
import { getWallistanConfig } from "@/integrations/wallistan/config";
import { getOrderFromPhp, addPaymentNoteToPhpOrder } from "@/integrations/wallistan/orders.server";

export const Route = createFileRoute("/api/wallistan/orders/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        if (!getWallistanConfig()) {
          return Response.json({ error: "Wallistan backend not configured" }, { status: 503 });
        }

        const url = new URL(request.url);
        const email = url.searchParams.get("email")?.trim();
        if (!email) {
          return Response.json({ error: "Email is required" }, { status: 400 });
        }

        const orderId = Number(params.id);
        if (!Number.isFinite(orderId) || orderId <= 0) {
          return Response.json({ error: "Invalid order id" }, { status: 400 });
        }

        try {
          const order = await getOrderFromPhp(orderId, email);
          if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
          return Response.json(order);
        } catch (error) {
          console.error("[GET /api/wallistan/orders/$id]", error);
          return Response.json({ error: "Order not found" }, { status: 404 });
        }
      },

      POST: async ({ params, request }) => {
        if (!getWallistanConfig()) {
          return Response.json({ error: "Wallistan backend not configured" }, { status: 503 });
        }

        const orderId = Number(params.id);
        if (!Number.isFinite(orderId) || orderId <= 0) {
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

          const ok = await addPaymentNoteToPhpOrder(orderId, {
            email,
            ...(body.method ? { method: body.method } : {}),
            ...(body.reference ? { reference: body.reference } : {}),
            ...(body.message ? { message: body.message } : {}),
          });

          if (!ok) return Response.json({ error: "Order not found" }, { status: 404 });
          return Response.json({ ok: true });
        } catch (error) {
          console.error("[POST /api/wallistan/orders/$id]", error);
          const message = error instanceof Error ? error.message : "Could not submit payment proof";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
