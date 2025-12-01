import { Supplier } from '../types/workflow';
import { StorageService } from './storage';

class SupplierService extends StorageService<Supplier> {
  constructor() {
    super('mbg_suppliers');
    this.initializeSampleData();
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const sampleSuppliers: Supplier[] = [
        {
          id: '1',
          code: 'SUP001',
          name: 'Toko Sumber Pangan',
          contactPerson: 'Budi Santoso',
          phone: '081234567890',
          email: 'budi@sumberpangan.com',
          address: 'Jl. Pasar No. 123, Jakarta',
          paymentTerms: 'Net 30 days',
          taxId: '01.234.567.8-901.000',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          code: 'SUP002',
          name: 'Pasar Tradisional',
          contactPerson: 'Siti Aminah',
          phone: '081298765432',
          address: 'Pasar Minggu, Jakarta Selatan',
          paymentTerms: 'Cash on Delivery',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          code: 'SUP003',
          name: 'PT Sayur Segar',
          contactPerson: 'Ahmad Hidayat',
          phone: '081312345678',
          email: 'ahmad@sayursegar.co.id',
          address: 'Jl. Raya Bogor KM 25, Cibinong',
          paymentTerms: 'Net 14 days',
          taxId: '02.345.678.9-012.000',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      sampleSuppliers.forEach(supplier => this.create(supplier));
    }
  }

  getActiveSuppliers(): Supplier[] {
    return this.getAll().filter(s => s.isActive);
  }

  findByCode(code: string): Supplier | undefined {
    return this.getAll().find(s => s.code === code);
  }

  deactivate(id: string): Supplier | null {
    return this.update(id, { isActive: false });
  }

  activate(id: string): Supplier | null {
    return this.update(id, { isActive: true });
  }
}

export const supplierService = new SupplierService();
