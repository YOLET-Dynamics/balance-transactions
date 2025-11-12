import {
  prisma,
  withTenantContext,
} from "../../infrastructure/database/prisma";
import type { DocType } from "@prisma/client";

export interface DocumentNumber {
  full: string;
  seqValue: number;
  year: number;
}

export class SequenceService {
  /**
   * Allocate next number for a document type
   * @param orgId - Organization ID
   * @param orgCode - Organization code for formatting
   * @param docType - Document type (CS, PV, PB)
   * @param year - Optional year (defaults to current year)
   */
  async allocateNext(
    orgId: string,
    orgCode: string,
    docType: DocType,
    year?: number
  ): Promise<DocumentNumber> {
    const targetYear = year || new Date().getFullYear();

    return await withTenantContext(orgId, async (tx) => {
      let sequence = await tx.numberSequence.findUnique({
        where: {
          orgId_docType_year: {
            orgId,
            docType,
            year: targetYear,
          },
        },
      });

      if (!sequence) {
        sequence = await tx.numberSequence.create({
          data: {
            orgId,
            docType,
            year: targetYear,
            nextValue: 1,
          },
        });
      }

      const seqValue = sequence.nextValue;

      await tx.numberSequence.update({
        where: { id: sequence.id },
        data: { nextValue: { increment: 1 } },
      });

      const paddedSeq = seqValue.toString().padStart(4, "0");
      const full = `${orgCode}-${docType}-${targetYear}-${paddedSeq}`;

      return {
        full,
        seqValue,
        year: targetYear,
      };
    });
  }

  async getCurrent(
    orgId: string,
    docType: DocType,
    year?: number
  ): Promise<number> {
    const targetYear = year || new Date().getFullYear();

    const sequence = await prisma.numberSequence.findUnique({
      where: {
        orgId_docType_year: {
          orgId,
          docType,
          year: targetYear,
        },
      },
    });

    return sequence?.nextValue || 1;
  }
}

export const sequenceService = new SequenceService();
