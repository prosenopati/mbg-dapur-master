import { InventoryBatch, StockTransaction, TransactionType } from '../types/workflow';
import { StorageService } from './storage';

class InventoryBatchService extends StorageService<InventoryBatch> {
  constructor() {
    super('mbg_inventory_batches');
  }

  createBatch(data: Omit<InventoryBatch, 'id' | 'status' | 'createdAt' | 'updatedAt'>): InventoryBatch {
    const batch: InventoryBatch = {
      ...data,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.create(batch);
  }

  getByInventoryItem(inventoryItemId: string): InventoryBatch[] {
    return this.getAll().filter(b => b.inventoryItemId === inventoryItemId && b.status === 'active');
  }

  getExpiringSoon(days: number = 7): InventoryBatch[] {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.getAll().filter(b => {
      if (!b.expiryDate || b.status !== 'active') return false;
      const expiryDate = new Date(b.expiryDate);
      return expiryDate <= futureDate && expiryDate >= new Date();
    });
  }

  getExpired(): InventoryBatch[] {
    const now = new Date();
    return this.getAll().filter(b => {
      if (!b.expiryDate) return false;
      return new Date(b.expiryDate) < now && b.status === 'active';
    });
  }

  reduceQuantity(id: string, quantity: number): InventoryBatch | null {
    const batch = this.getById(id);
    if (!batch) return null;

    const newQuantity = Math.max(0, batch.quantity - quantity);
    const status = newQuantity === 0 ? 'depleted' : batch.status;

    return this.update(id, { quantity: newQuantity, status });
  }

  markExpired(id: string): InventoryBatch | null {
    return this.update(id, { status: 'expired' });
  }
}

class StockTransactionService extends StorageService<StockTransaction> {
  constructor() {
    super('mbg_stock_transactions');
  }

  recordTransaction(data: Omit<StockTransaction, 'id' | 'createdAt'>): StockTransaction {
    const transaction: StockTransaction = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return this.create(transaction);
  }

  getByInventoryItem(inventoryItemId: string): StockTransaction[] {
    return this.getAll()
      .filter(t => t.inventoryItemId === inventoryItemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getByType(type: TransactionType): StockTransaction[] {
    return this.getAll()
      .filter(t => t.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getByDateRange(startDate: string, endDate: string): StockTransaction[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.getAll().filter(t => {
      const transDate = new Date(t.createdAt);
      return transDate >= start && transDate <= end;
    });
  }

  getByReference(referenceId: string, referenceType: string): StockTransaction[] {
    return this.getAll().filter(t => 
      t.referenceId === referenceId && t.referenceType === referenceType
    );
  }
}

export const inventoryBatchService = new InventoryBatchService();
export const stockTransactionService = new StockTransactionService();
