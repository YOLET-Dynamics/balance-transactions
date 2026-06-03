import React from "react";
import { purchasesService } from "@/application/services/purchases.service";
import { renderToStream } from "@react-pdf/renderer";
import { PurchaseBillPDF } from "@/infrastructure/pdf/purchase-bill.template";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";
import { createRoute, streamNodeResponse } from "@/lib/api/route-handler";
import { NotFoundError } from "@/lib/utils/errors";

export const GET = createRoute(
  async ({ params, auth }) => {
    const organization = await authRepository.findOrgById(auth!.orgId);

    if (!organization) {
      throw new NotFoundError("Organization not found");
    }

    const bill = await purchasesService.getBillById(auth!.orgId, params!.id);

    const pdfDocument = React.createElement(PurchaseBillPDF, {
      bill,
      organization,
    });

    const stream = await renderToStream(
      pdfDocument as Parameters<typeof renderToStream>[0]
    );

    return streamNodeResponse(stream, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="purchase-bill-${bill.number}.pdf"`,
      "Cache-Control": "no-store",
    });
  },
  {
    requireAuth: true,
    rateLimit: "pdf",
  }
);
