// Base localStorage utility - can be swapped with API calls for production
// This abstraction makes migration to database seamless

export class StorageService<T> {
  private storageKey: string;

  constructor(key: string) {
    this.storageKey = key;
  }

  getAll(): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find((item: any) => item.id === id);
  }

  create(item: T): T {
    const items = this.getAll();
    items.push(item);
    this.saveAll(items);
    return item;
  }

  update(id: string, updates: Partial<T>): T | null {
    const items = this.getAll();
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveAll(items);
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter((item: any) => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    this.saveAll(filteredItems);
    return true;
  }

  private saveAll(items: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}
