import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { salesService } from "@/application/services/sales.service";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { updateSalesInvoiceSchema } from "@/lib/validation/schemas";

export const GET = createRoute(
  async ({ params, auth }) => {
    const invoice = await salesService.getInvoiceById(auth!.orgId, params!.id);
    return invoice;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const PATCH = createRoute(
  async ({ params, auth, request }) => {
    requireRole(auth!, "Manager");

    const body = getValidatedBody<typeof updateSalesInvoiceSchema._type>(request);
    if (body.fiscalReceiptNumber !== undefined) {
      const existing = await salesService.getInvoiceById(auth!.orgId, params!.id);
      if (
        existing.status === "Paid" &&
        existing.fiscalReceiptNumber &&
        existing.fiscalReceiptNumber !== body.fiscalReceiptNumber
      ) {
        requireRole(auth!, "Admin");
      }
    }

    const invoice = await salesService.updateInvoice(
      auth!.orgId,
      params!.id,
      body
    );

    return invoice;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: updateSalesInvoiceSchema,
  }
);

export const DELETE = createRoute(
  async ({ params, auth }) => {
    requireRole(auth!, "Admin");

    await salesService.deleteInvoice(auth!.orgId, params!.id);

    return { success: true, message: "Invoice deleted successfully" };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);
