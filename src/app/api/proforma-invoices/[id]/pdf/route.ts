import React from "react";
import { proformaService } from "@/application/services/proforma.service";
import { renderToStream } from "@react-pdf/renderer";
import { ProformaInvoicePDF } from "@/infrastructure/pdf/proforma-invoice.template";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";
import { createRoute, streamNodeResponse } from "@/lib/api/route-handler";
import { NotFoundError } from "@/lib/utils/errors";

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

    const proforma = await proformaService.getProformaById(
      auth!.orgId,
      params!.id
    );

    const pdfDocument = React.createElement(ProformaInvoicePDF, {
      proforma,
      organization,
    });

    const stream = await renderToStream(
      pdfDocument as Parameters<typeof renderToStream>[0]
    );

    return streamNodeResponse(stream, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proforma-${proforma.number}.pdf"`,
      "Cache-Control": "no-store",
    });
  },
  {
    requireAuth: true,
    rateLimit: "pdf",
  }
);
