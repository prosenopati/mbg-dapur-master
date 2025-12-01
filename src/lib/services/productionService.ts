import { ProductionPlan, ProductionStatus, WasteRecord } from '../types/workflow';
import { StorageService } from './storage';

class ProductionPlanService extends StorageService<ProductionPlan> {
  constructor() {
    super('mbg_production_plans');
    this.initializeSampleData();
  }

  private generatePlanNumber(): string {
    const count = this.getAll().length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `PROD-${year}${month}-${String(count).padStart(4, '0')}`;
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const today = new Date().toISOString().split('T')[0];
      
      const samplePlan: ProductionPlan = {
        id: '1',
        planNumber: this.generatePlanNumber(),
        date: today,
        shift: 'morning',
        outputs: [
          {
            menuItemId: '1',
            menuItemName: 'Nasi Goreng Spesial',
            plannedQuantity: 50,
            actualQuantity: 48,
          },
          {
            menuItemId: '2',
            menuItemName: 'Ayam Goreng Kremes',
            plannedQuantity: 40,
            actualQuantity: 40,
          },
        ],
        materials: [
          {
            inventoryItemId: '1',
            inventoryItemName: 'Beras',
            requiredQuantity: 10,
            actualQuantity: 10,
            unit: 'kg',
          },
          {
            inventoryItemId: '2',
            inventoryItemName: 'Ayam',
            requiredQuantity: 8,
            actualQuantity: 8,
            unit: 'kg',
          },
          {
            inventoryItemId: '3',
            inventoryItemName: 'Sayuran Campuran',
            requiredQuantity: 5,
            actualQuantity: 5,
            unit: 'kg',
          },
        ],
        status: 'completed',
        plannedBy: 'Chef Manager',
        startedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.create(samplePlan);
    }
  }

  createPlan(data: Omit<ProductionPlan, 'id' | 'planNumber' | 'createdAt' | 'updatedAt'>): ProductionPlan {
    const planNumber = this.generatePlanNumber();
    const plan: ProductionPlan = {
      ...data,
      id: Date.now().toString(),
      planNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.create(plan);
  }

  updateStatus(id: string, status: ProductionStatus, metadata?: { startedAt?: string; completedAt?: string }): ProductionPlan | null {
    const updates: Partial<ProductionPlan> = { status };

    if (status === 'in_progress' && !metadata?.startedAt) {
      updates.startedAt = new Date().toISOString();
    }

    if (status === 'completed' && !metadata?.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    if (metadata?.startedAt) updates.startedAt = metadata.startedAt;
    if (metadata?.completedAt) updates.completedAt = metadata.completedAt;

    return this.update(id, updates);
  }

  getByDate(date: string): ProductionPlan[] {
    return this.getAll().filter(p => p.date === date);
  }

  getByStatus(status: ProductionStatus): ProductionPlan[] {
    return this.getAll().filter(p => p.status === status);
  }

  getByDateRange(startDate: string, endDate: string): ProductionPlan[] {
    return this.getAll().filter(p => p.date >= startDate && p.date <= endDate);
  }

  getPlanned(): ProductionPlan[] {
    return this.getByStatus('planned');
  }

  getInProgress(): ProductionPlan[] {
    return this.getByStatus('in_progress');
  }
}

class WasteRecordService extends StorageService<WasteRecord> {
  constructor() {
    super('mbg_waste_records');
  }

  recordWaste(data: Omit<WasteRecord, 'id' | 'createdAt'>): WasteRecord {
    const waste: WasteRecord = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return this.create(waste);
  }

  getByInventoryItem(inventoryItemId: string): WasteRecord[] {
    return this.getAll()
      .filter(w => w.inventoryItemId === inventoryItemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getByDateRange(startDate: string, endDate: string): WasteRecord[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.getAll().filter(w => {
      const wasteDate = new Date(w.createdAt);
      return wasteDate >= start && wasteDate <= end;
    });
  }

  getByReason(reason: WasteRecord['reason']): WasteRecord[] {
    return this.getAll().filter(w => w.reason === reason);
  }

  getTotalWasteByPeriod(startDate: string, endDate: string): { [key: string]: number } {
    const records = this.getByDateRange(startDate, endDate);
    const summary: { [key: string]: number } = {};

    records.forEach(record => {
      if (!summary[record.inventoryItemName]) {
        summary[record.inventoryItemName] = 0;
      }
      summary[record.inventoryItemName] += record.quantity;
    });

    return summary;
  }
}

export const productionPlanService = new ProductionPlanService();
export const wasteRecordService = new WasteRecordService();
