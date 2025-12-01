import { InventoryItem, InventoryStatus } from '../types';
import { StorageService } from './storage';

class InventoryService extends StorageService<InventoryItem> {
  constructor() {
    super('mbg_inventory');
    this.initializeSampleData();
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const sampleInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Beras',
          category: 'Bahan Pokok',
          quantity: 50,
          unit: 'kg',
          minimumStock: 20,
          status: 'in-stock',
          supplier: 'Toko Sumber Pangan',
          lastRestocked: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Ayam',
          category: 'Protein',
          quantity: 15,
          unit: 'kg',
          minimumStock: 10,
          status: 'in-stock',
          supplier: 'Pasar Tradisional',
          lastRestocked: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Sayuran Campuran',
          category: 'Sayuran',
          quantity: 8,
          unit: 'kg',
          minimumStock: 10,
          status: 'low-stock',
          supplier: 'Pasar Tradisional',
          lastRestocked: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Minyak Goreng',
          category: 'Bahan Pokok',
          quantity: 12,
          unit: 'liter',
          minimumStock: 8,
          status: 'in-stock',
          supplier: 'Toko Sumber Pangan',
          lastRestocked: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Bumbu Dapur',
          category: 'Bumbu',
          quantity: 25,
          unit: 'pcs',
          minimumStock: 15,
          status: 'in-stock',
          supplier: 'Toko Sumber Pangan',
          lastRestocked: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '6',
          name: 'Kacang Tanah',
          category: 'Bahan Pokok',
          quantity: 3,
          unit: 'kg',
          minimumStock: 5,
          status: 'low-stock',
          supplier: 'Pasar Tradisional',
          lastRestocked: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '7',
          name: 'Teh',
          category: 'Minuman',
          quantity: 0,
          unit: 'box',
          minimumStock: 5,
          status: 'out-of-stock',
          supplier: 'Toko Sumber Pangan',
          lastRestocked: new Date(Date.now() - 259200000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      sampleInventory.forEach(item => this.create(item));
    }
  }

  private updateStatus(item: InventoryItem): InventoryStatus {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.minimumStock) return 'low-stock';
    return 'in-stock';
  }

  updateQuantity(id: string, quantity: number): InventoryItem | null {
    const item = this.getById(id);
    if (!item) return null;

    const updatedItem = { ...item, quantity };
    const status = this.updateStatus(updatedItem);
    
    return this.update(id, { quantity, status });
  }

  restock(id: string, quantity: number): InventoryItem | null {
    const item = this.getById(id);
    if (!item) return null;

    const newQuantity = item.quantity + quantity;
    const status = this.updateStatus({ ...item, quantity: newQuantity });

    return this.update(id, {
      quantity: newQuantity,
      status,
      lastRestocked: new Date().toISOString(),
    });
  }

  getLowStockItems(): InventoryItem[] {
    return this.getAll().filter(item => 
      item.status === 'low-stock' || item.status === 'out-of-stock'
    );
  }

  getByStatus(status: InventoryStatus): InventoryItem[] {
    return this.getAll().filter(item => item.status === status);
  }
}

export const inventoryService = new InventoryService();
