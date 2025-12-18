import React from "react";
import { NextResponse } from "next/server";
import { salesService } from "@/application/services/sales.service";
import { renderToStream } from "@react-pdf/renderer";
import { SalesInvoicePaidPDF } from "@/infrastructure/pdf/sales-invoice-paid.template";
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
        { error: "Invoice ID is required" },
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

    // Hash the token to find session
    const crypto = await import("crypto");
    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionCookie)
      .digest("hex");

    const session = await authRepository.findSessionByToken(tokenHash);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get organization from session
    const orgData = await authRepository.findOrgById(session.orgId);

    if (!orgData) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const organization = {
      ...orgData,
      logoUrl: (orgData as any).logoAttachment?.url || null,
    };

    // Verify membership
    const membership = await authRepository.findMembershipByUserAndOrg(
      session.userId,
      session.orgId
    );

    if (!membership) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get the invoice
    const invoice = await salesService.getInvoiceById(session.orgId, id);

    // Check if invoice is paid
    if (invoice.status !== "Paid") {
      return NextResponse.json(
        { error: "Invoice must be paid to generate paid receipt" },
        { status: 400 }
      );
    }

    // Generate PDF document element
    const pdfDocument = React.createElement(SalesInvoicePaidPDF, {
      invoice,
      organization,
    });

    // Render to stream
    const stream = await renderToStream(pdfDocument as any);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }

    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const buffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Return PDF as response
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.number}-PAID.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate paid PDF", details: (error as Error).message },
      { status: 500 }
    );
  }
}

