import { MenuItem, MenuCategory } from '../types';
import { StorageService } from './storage';

class MenuService extends StorageService<MenuItem> {
  constructor() {
    super('mbg_menu_items');
    this.initializeSampleData();
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const sampleMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Nasi Goreng Spesial',
          category: 'lunch',
          description: 'Nasi goreng dengan telur, ayam, dan sayuran segar',
          price: 25000,
          imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
          isAvailable: true,
          preparationTime: 15,
          ingredients: ['1', '2', '3'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Soto Ayam',
          category: 'lunch',
          description: 'Soto ayam tradisional dengan kuah kuning yang gurih',
          price: 20000,
          imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
          isAvailable: true,
          preparationTime: 20,
          ingredients: ['2', '4', '5'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Gado-Gado',
          category: 'lunch',
          description: 'Sayuran rebus dengan bumbu kacang khas Indonesia',
          price: 18000,
          imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
          isAvailable: true,
          preparationTime: 10,
          ingredients: ['3', '5', '6'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Es Teh Manis',
          category: 'beverage',
          description: 'Teh manis dingin yang menyegarkan',
          price: 5000,
          imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
          isAvailable: true,
          preparationTime: 3,
          ingredients: ['7'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Nasi Uduk',
          category: 'breakfast',
          description: 'Nasi gurih dengan lauk pauk lengkap',
          price: 15000,
          imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b3b2d6b2a7?w=400',
          isAvailable: true,
          preparationTime: 12,
          ingredients: ['1', '2', '3'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      sampleMenuItems.forEach(item => this.create(item));
    }
  }

  getByCategory(category: MenuCategory): MenuItem[] {
    return this.getAll().filter(item => item.category === category);
  }

  getAvailableItems(): MenuItem[] {
    return this.getAll().filter(item => item.isAvailable);
  }

  toggleAvailability(id: string): MenuItem | null {
    const item = this.getById(id);
    if (!item) return null;
    return this.update(id, { isAvailable: !item.isAvailable });
  }
}

export const menuService = new MenuService();
