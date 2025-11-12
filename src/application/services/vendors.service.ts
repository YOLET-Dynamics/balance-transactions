import { vendorsRepository } from "@/infrastructure/repositories/vendors.repository.impl";
import type {
  Vendor,
  CreateVendorData,
} from "@/domain/repositories/vendors.repository";

class VendorsService {
  async createVendor(orgId: string, data: CreateVendorData): Promise<Vendor> {
    return await vendorsRepository.create(orgId, data);
  }

  async getVendorById(orgId: string, id: string): Promise<Vendor | null> {
    return await vendorsRepository.findById(orgId, id);
  }

  async listVendors(orgId: string, search?: string): Promise<Vendor[]> {
    return await vendorsRepository.list(orgId, search);
  }

  async updateVendor(
    orgId: string,
    id: string,
    data: Partial<CreateVendorData>
  ): Promise<Vendor> {
    return await vendorsRepository.update(orgId, id, data);
  }

  async deleteVendor(orgId: string, id: string): Promise<void> {
    return await vendorsRepository.delete(orgId, id);
  }
}

export const vendorsService = new VendorsService();

