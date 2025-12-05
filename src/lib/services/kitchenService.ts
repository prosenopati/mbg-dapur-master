import { Kitchen } from '../types/kitchen';
import { StorageService } from './storage';

class KitchenService extends StorageService<Kitchen> {
  constructor() {
    super('mbg_kitchens');
    this.initializeSampleData();
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const sampleKitchens: Kitchen[] = [
        {
          id: 'dapur-mbg-1',
          code: 'MBG-001',
          name: 'Dapur MBG Pusat',
          location: 'Jakarta Pusat',
          address: 'Jl. Sudirman No. 45, Jakarta Pusat',
          managerId: 'mgr-001',
          managerName: 'Ibu Sari Rahmawati',
          phone: '021-5551234',
          email: 'sari.rahmawati@mbgdapur.id',
          capacity: 500,
          operatingHours: '06:00 - 20:00',
          isActive: true,
          notes: 'Dapur utama untuk wilayah Jakarta Pusat dan sekitarnya',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'dapur-mbg-2',
          code: 'MBG-002',
          name: 'Dapur MBG Barat',
          location: 'Jakarta Barat',
          address: 'Jl. Panjang Raya No. 88, Jakarta Barat',
          managerId: 'mgr-002',
          managerName: 'Bapak Rudi Hartono',
          phone: '021-5557890',
          email: 'rudi.hartono@mbgdapur.id',
          capacity: 400,
          operatingHours: '06:00 - 20:00',
          isActive: true,
          notes: 'Melayani area Jakarta Barat dan Tangerang',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'dapur-mbg-3',
          code: 'MBG-003',
          name: 'Dapur MBG Timur',
          location: 'Jakarta Timur',
          address: 'Jl. Raya Kalimalang No. 123, Jakarta Timur',
          managerId: 'mgr-003',
          managerName: 'Ibu Dewi Kusuma',
          phone: '021-8884567',
          email: 'dewi.kusuma@mbgdapur.id',
          capacity: 350,
          operatingHours: '06:00 - 20:00',
          isActive: true,
          notes: 'Melayani area Jakarta Timur dan Bekasi',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      sampleKitchens.forEach(kitchen => this.create(kitchen));
    }
  }

  getActiveKitchens(): Kitchen[] {
    return this.getAll().filter(k => k.isActive);
  }

  findByCode(code: string): Kitchen | undefined {
    return this.getAll().find(k => k.code === code);
  }

  deactivate(id: string): Kitchen | null {
    return this.update(id, { isActive: false });
  }

  activate(id: string): Kitchen | null {
    return this.update(id, { isActive: true });
  }
}

export const kitchenService = new KitchenService();
