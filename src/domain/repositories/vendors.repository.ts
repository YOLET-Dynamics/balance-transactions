export interface Vendor {
  id: string;
  orgId: string;
  type: "Individual" | "Company";
  legalName: string | null;
  tradeName: string | null;
  subcity: string | null;
  cityRegion: string | null;
  country: string;
  tin: string | null;
  vatNumber: string | null;
  phone: string | null;
  email: string | null;
  contactPerson: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  type: "Individual" | "Company";
  legalName?: string | null;
  tradeName?: string | null;
  subcity?: string | null;
  cityRegion?: string | null;
  country?: string;
  tin?: string | null;
  vatNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  notes?: string | null;
}

export interface IVendorsRepository {
  create(orgId: string, data: CreateVendorData): Promise<Vendor>;
  findById(orgId: string, id: string): Promise<Vendor | null>;
  list(orgId: string, search?: string): Promise<Vendor[]>;
  update(
    orgId: string,
    id: string,
    data: Partial<CreateVendorData>
  ): Promise<Vendor>;
  delete(orgId: string, id: string): Promise<void>;
}
