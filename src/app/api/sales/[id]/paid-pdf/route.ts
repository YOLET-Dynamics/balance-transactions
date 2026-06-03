import React from "react";
import { salesService } from "@/application/services/sales.service";
import { renderToStream } from "@react-pdf/renderer";
import { SalesInvoicePaidPDF } from "@/infrastructure/pdf/sales-invoice-paid.template";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";
import { createRoute, streamNodeResponse } from "@/lib/api/route-handler";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";

export const GET = createRoute(
  async ({ params, auth }) => {
    const orgData = await authRepository.findOrgById(auth!.orgId);

    if (!orgData) {
      throw new NotFoundError("Organization not found");
    }

    const organization = {
      ...orgData,
      logoUrl:
        (
          orgData as typeof orgData & {
            logoAttachment?: { url: string | null } | null;
          }
        ).logoAttachment?.url || null,
    };

    const invoice = await salesService.getInvoiceById(auth!.orgId, params!.id);

    if (invoice.status !== "Paid") {
      throw new ValidationError(
        "Invoice must be paid to generate paid receipt"
      );
    }

    const pdfDocument = React.createElement(SalesInvoicePaidPDF, {
      invoice,
      organization,
    });

    const stream = await renderToStream(
      pdfDocument as Parameters<typeof renderToStream>[0]
    );

    return streamNodeResponse(stream, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${invoice.number}-PAID.pdf"`,
      "Cache-Control": "no-store",
    });
  },
  {
    requireAuth: true,
    rateLimit: "pdf",
  }
);
