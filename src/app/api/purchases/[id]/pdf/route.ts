import React from "react";
import { NextResponse } from "next/server";
import { purchasesService } from "@/application/services/purchases.service";
import { renderToStream } from "@react-pdf/renderer";
import { PurchaseBillPDF } from "@/infrastructure/pdf/purchase-bill.template";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Purchase bill ID is required" },
        { status: 400 }
      );
    }

    const sessionCookie = request.cookies.get("session_token")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Not authenticated - no session cookie" },
        { status: 401 }
      );
    }

    const crypto = await import("crypto");
    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionCookie)
      .digest("hex");

    const session = await authRepository.findSessionByToken(tokenHash);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const organization = await authRepository.findOrgById(session.orgId);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const membership = await authRepository.findMembershipByUserAndOrg(
      session.userId,
      session.orgId
    );

    if (!membership) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const bill = await purchasesService.getBillById(session.orgId, id);

    const pdfDocument = React.createElement(PurchaseBillPDF, {
      bill,
      organization,
    });

    const stream = await renderToStream(pdfDocument as any);

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
    
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="purchase-bill-${bill.number}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: (error as Error).message },
      { status: 500 }
    );
  }
}

