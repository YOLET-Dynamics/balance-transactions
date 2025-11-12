import { prisma } from "@/infrastructure/database/prisma";
import type {
  Vendor,
  CreateVendorData,
  IVendorsRepository,
} from "@/domain/repositories/vendors.repository";

async function withTenantContext<T>(
  orgId: string,
  operation: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return operation(prisma);
}

function serializeVendor(vendor: any): Vendor {
  if (!vendor) return vendor;

  return {
    ...vendor,
    createdAt: vendor.createdAt ? vendor.createdAt.toISOString() : null,
    updatedAt: vendor.updatedAt ? vendor.updatedAt.toISOString() : null,
  };
}

class VendorsRepositoryImpl implements IVendorsRepository {
  async create(orgId: string, data: CreateVendorData): Promise<Vendor> {
    return await withTenantContext(orgId, async (tx) => {
      const vendor = await tx.vendor.create({
        data: {
          orgId,
          type: data.type,
          legalName: data.legalName,
          tradeName: data.tradeName,
          subcity: data.subcity,
          cityRegion: data.cityRegion,
          country: data.country || "ET",
          tin: data.tin,
          vatNumber: data.vatNumber,
          phone: data.phone,
          email: data.email,
          contactPerson: data.contactPerson,
          notes: data.notes,
        },
      });

      return serializeVendor(vendor);
    });
  }

  async findById(orgId: string, id: string): Promise<Vendor | null> {
    return await withTenantContext(orgId, async (tx) => {
      const vendor = await tx.vendor.findFirst({
        where: { id, orgId },
      });

      return serializeVendor(vendor);
    });
  }

  async list(orgId: string, search?: string): Promise<Vendor[]> {
    return await withTenantContext(orgId, async (tx) => {
      const where: any = { orgId };

      if (search) {
        where.OR = [
          { legalName: { contains: search, mode: "insensitive" } },
          { tradeName: { contains: search, mode: "insensitive" } },
          { tin: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      const vendors = await tx.vendor.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return vendors.map(serializeVendor);
    });
  }

  async update(
    orgId: string,
    id: string,
    data: Partial<CreateVendorData>
  ): Promise<Vendor> {
    return await withTenantContext(orgId, async (tx) => {
      const vendor = await tx.vendor.update({
        where: { id },
        data: {
          type: data.type,
          legalName: data.legalName,
          tradeName: data.tradeName,
          subcity: data.subcity,
          cityRegion: data.cityRegion,
          country: data.country,
          tin: data.tin,
          vatNumber: data.vatNumber,
          phone: data.phone,
          email: data.email,
          contactPerson: data.contactPerson,
          notes: data.notes,
        },
      });

      return serializeVendor(vendor);
    });
  }

  async delete(orgId: string, id: string): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.vendor.delete({
        where: { id },
      });
    });
  }
}

export const vendorsRepository = new VendorsRepositoryImpl();

