import { MenuPlan, MenuPlanIngredient, MenuPlanStatus, TargetGroup, DayOfWeek, IngredientCategory } from '../types';
import { StorageService } from './storage';

class MenuPlanService extends StorageService<MenuPlan> {
  constructor() {
    super('mbg_menu_plans');
    this.initializeSampleData();
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const samplePlans: MenuPlan[] = [
        {
          id: '1',
          planCode: 'MNU/25.10/0001',
          masterMenu: 'Nasi+Orek Tempe+Sayur Labu siam+Ayam Goreng',
          targetGroup: 'SMA',
          date: '2025-10-27',
          dayOfWeek: 'Senin',
          portionCount: 2830,
          status: 'confirmed',
          ingredients: [
            {
              id: 'ing-1',
              category: 'Karbohidrat',
              productName: 'Nasi',
              plannedQty: 566,
              unit: 'kg',
              notes: 'Qty 566000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-2',
              category: 'Protein Hewani',
              productName: 'Ayam Goreng Telur',
              plannedQty: 113.2,
              unit: 'kg',
              notes: 'Qty 113200.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-3',
              category: 'Protein Nabati',
              productName: 'Tahu Tempe Sambal Goreng Kacap',
              plannedQty: 35.38,
              unit: 'kg',
              notes: 'Qty 35375.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-4',
              category: 'Sayur',
              productName: 'Tumis Labu Siam',
              plannedQty: 283,
              unit: 'kg',
              notes: 'Qty 283000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-5',
              category: 'Buah',
              productName: 'Pisang Cavendish',
              plannedQty: 2830,
              unit: 'potong',
              notes: 'Total Qty berdasarkan standar porsi dan jumlah porsi konsumen',
            },
          ],
          confirmedAt: '2025-10-25T08:30:00.000Z',
          confirmedBy: 'Admin',
          createdAt: '2025-10-24T10:00:00.000Z',
          updatedAt: '2025-10-25T08:30:00.000Z',
          createdBy: 'System',
        },
        {
          id: '2',
          planCode: 'MNU/25.10/0002',
          masterMenu: 'Nasi+Ayam Bakar Kecap+Tumis Buncis+Tahu Goreng',
          targetGroup: 'SMP',
          date: '2025-10-28',
          dayOfWeek: 'Selasa',
          portionCount: 1500,
          status: 'production',
          ingredients: [
            {
              id: 'ing-6',
              category: 'Karbohidrat',
              productName: 'Nasi',
              plannedQty: 300,
              unit: 'kg',
              notes: 'Qty 300000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-7',
              category: 'Protein Hewani',
              productName: 'Ayam Bakar Kecap',
              plannedQty: 60,
              unit: 'kg',
              notes: 'Qty 60000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-8',
              category: 'Protein Nabati',
              productName: 'Tahu Goreng',
              plannedQty: 22.5,
              unit: 'kg',
              notes: 'Qty 22500.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-9',
              category: 'Sayur',
              productName: 'Tumis Buncis',
              plannedQty: 150,
              unit: 'kg',
              notes: 'Qty 150000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-10',
              category: 'Buah',
              productName: 'Jeruk Manis',
              plannedQty: 1500,
              unit: 'buah',
              notes: 'Total Qty berdasarkan standar porsi dan jumlah porsi konsumen',
            },
          ],
          confirmedAt: '2025-10-26T09:00:00.000Z',
          confirmedBy: 'Admin',
          productionStartedAt: '2025-10-28T05:00:00.000Z',
          createdAt: '2025-10-25T11:00:00.000Z',
          updatedAt: '2025-10-28T05:00:00.000Z',
          createdBy: 'System',
        },
        {
          id: '3',
          planCode: 'MNU/25.10/0003',
          masterMenu: 'Nasi+Ikan Goreng+Sayur Asem+Tempe Bacem',
          targetGroup: 'SD',
          date: '2025-10-29',
          dayOfWeek: 'Rabu',
          portionCount: 2000,
          status: 'draft',
          ingredients: [
            {
              id: 'ing-11',
              category: 'Karbohidrat',
              productName: 'Nasi',
              plannedQty: 400,
              unit: 'kg',
              notes: 'Qty 400000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-12',
              category: 'Protein Hewani',
              productName: 'Ikan Goreng',
              plannedQty: 80,
              unit: 'kg',
              notes: 'Qty 80000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-13',
              category: 'Protein Nabati',
              productName: 'Tempe Bacem',
              plannedQty: 30,
              unit: 'kg',
              notes: 'Qty 30000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-14',
              category: 'Sayur',
              productName: 'Sayur Asem',
              plannedQty: 200,
              unit: 'kg',
              notes: 'Qty 200000.0 gram dikonversi ke kg',
            },
            {
              id: 'ing-15',
              category: 'Buah',
              productName: 'Apel',
              plannedQty: 2000,
              unit: 'buah',
              notes: 'Total Qty berdasarkan standar porsi dan jumlah porsi konsumen',
            },
          ],
          createdAt: '2025-10-26T14:00:00.000Z',
          updatedAt: '2025-10-26T14:00:00.000Z',
          createdBy: 'System',
        },
      ];

      samplePlans.forEach(plan => this.create(plan));
    }
  }

  updateStatus(id: string, status: MenuPlanStatus, userId?: string): MenuPlan | null {
    const plan = this.getById(id);
    if (!plan) return null;

    const updates: Partial<MenuPlan> = { status };
    const now = new Date().toISOString();

    switch (status) {
      case 'confirmed':
        updates.confirmedAt = now;
        updates.confirmedBy = userId;
        break;
      case 'production':
        updates.productionStartedAt = now;
        break;
      case 'portioning':
        updates.portioningStartedAt = now;
        break;
      case 'delivery':
        updates.deliveryStartedAt = now;
        break;
      case 'completed':
        updates.completedAt = now;
        break;
    }

    return this.update(id, updates);
  }

  generatePlanCode(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const allPlans = this.getAll();
    const prefix = `MNU/${year}.${month}/`;
    const existingCodes = allPlans
      .filter(p => p.planCode.startsWith(prefix))
      .map(p => parseInt(p.planCode.split('/')[2]))
      .filter(n => !isNaN(n));
    
    const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  getByStatus(status: MenuPlanStatus): MenuPlan[] {
    return this.getAll().filter(plan => plan.status === status);
  }

  getByDateRange(startDate: string, endDate: string): MenuPlan[] {
    return this.getAll().filter(plan => {
      return plan.date >= startDate && plan.date <= endDate;
    });
  }

  getByTargetGroup(targetGroup: TargetGroup): MenuPlan[] {
    return this.getAll().filter(plan => plan.targetGroup === targetGroup);
  }
}

export const menuPlanService = new MenuPlanService();
