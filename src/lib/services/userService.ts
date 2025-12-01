import { User } from '../types';
import { roleService } from './roleService';

class UserService {
  private readonly STORAGE_KEY = 'mbg_users';

  private initializeUsers(): User[] {
    const users: User[] = [
      {
        id: 'u1',
        username: 'admin',
        email: 'admin@mbgdapur.com',
        fullName: 'Administrator',
        phone: '081234567890',
        roleId: 'r1',
        roleName: 'Super Admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'u2',
        username: 'manager',
        email: 'manager@mbgdapur.com',
        fullName: 'Budi Santoso',
        phone: '082345678901',
        roleId: 'r2',
        roleName: 'Manager',
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'u3',
        username: 'hrstaff',
        email: 'hr@mbgdapur.com',
        fullName: 'Siti Nurhaliza',
        phone: '083456789012',
        roleId: 'r3',
        roleName: 'HR Staff',
        isActive: true,
        lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'u4',
        username: 'finance',
        email: 'finance@mbgdapur.com',
        fullName: 'Ahmad Wijaya',
        phone: '084567890123',
        roleId: 'r4',
        roleName: 'Finance Staff',
        isActive: true,
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'u5',
        username: 'kitchen',
        email: 'kitchen@mbgdapur.com',
        fullName: 'Dewi Lestari',
        phone: '085678901234',
        roleId: 'r5',
        roleName: 'Kitchen Staff',
        isActive: true,
        lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return users;
  }

  getAll(): User[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return this.initializeUsers();
    }
    return JSON.parse(stored);
  }

  getById(id: string): User | undefined {
    return this.getAll().find(user => user.id === id);
  }

  getByUsername(username: string): User | undefined {
    return this.getAll().find(user => user.username === username);
  }

  getByEmail(email: string): User | undefined {
    return this.getAll().find(user => user.email === email);
  }

  getByRole(roleId: string): User[] {
    return this.getAll().filter(user => user.roleId === roleId);
  }

  getActiveUsers(): User[] {
    return this.getAll().filter(user => user.isActive);
  }

  create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'roleName'>): User {
    const users = this.getAll();
    
    // Get role name
    const role = roleService.getById(userData.roleId);
    
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`,
      roleName: role?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return newUser;
  }

  update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'roleName'>>): User | null {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) return null;
    
    // Update role name if roleId changed
    let roleName = users[index].roleName;
    if (updates.roleId) {
      const role = roleService.getById(updates.roleId);
      roleName = role?.name;
    }
    
    users[index] = {
      ...users[index],
      ...updates,
      roleName,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return users[index];
  }

  delete(id: string): boolean {
    const users = this.getAll();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  toggleActive(id: string): User | null {
    const user = this.getById(id);
    if (!user) return null;
    
    return this.update(id, { isActive: !user.isActive });
  }

  updateLastLogin(id: string): User | null {
    return this.update(id, { lastLogin: new Date().toISOString() });
  }

  hasPermission(userId: string, permissionCode: string): boolean {
    const user = this.getById(userId);
    if (!user) return false;
    
    return roleService.hasPermission(user.roleId, permissionCode);
  }

  getUserPermissions(userId: string): string[] {
    const user = this.getById(userId);
    if (!user) return [];
    
    const permissions = roleService.getRolePermissions(user.roleId);
    return permissions.map(p => p.code);
  }
}

export const userService = new UserService();
