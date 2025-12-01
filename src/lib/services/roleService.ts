import { Role, Permission } from '../types';

class RoleService {
  private readonly STORAGE_KEY = 'mbg_roles';
  private readonly PERMISSIONS_KEY = 'mbg_permissions';

  // Initialize default permissions
  private initializePermissions(): Permission[] {
    const permissions: Permission[] = [
      // HR Module
      { id: 'p1', name: 'View Users', code: 'users.read', description: 'View user list', module: 'HR', createdAt: new Date().toISOString() },
      { id: 'p2', name: 'Create Users', code: 'users.create', description: 'Create new users', module: 'HR', createdAt: new Date().toISOString() },
      { id: 'p3', name: 'Edit Users', code: 'users.update', description: 'Edit user information', module: 'HR', createdAt: new Date().toISOString() },
      { id: 'p4', name: 'Delete Users', code: 'users.delete', description: 'Delete users', module: 'HR', createdAt: new Date().toISOString() },
      { id: 'p5', name: 'View Roles', code: 'roles.read', description: 'View role list', module: 'HR', createdAt: new Date().toISOString() },
      { id: 'p6', name: 'Manage Roles', code: 'roles.manage', description: 'Create, edit, delete roles', module: 'HR', createdAt: new Date().toISOString() },
      { id: 'p7', name: 'View Employees', code: 'employees.read', description: 'View employee list', module: 'HR', createdAt: new Date().toISOString() },
      { id: 'p8', name: 'Manage Employees', code: 'employees.manage', description: 'Create, edit, delete employees', module: 'HR', createdAt: new Date().toISOString() },
      
      // Finance Module
      { id: 'p9', name: 'View Payroll', code: 'payroll.read', description: 'View payroll records', module: 'Finance', createdAt: new Date().toISOString() },
      { id: 'p10', name: 'Create Payroll', code: 'payroll.create', description: 'Create payroll records', module: 'Finance', createdAt: new Date().toISOString() },
      { id: 'p11', name: 'Process Payroll', code: 'payroll.process', description: 'Process and approve payroll', module: 'Finance', createdAt: new Date().toISOString() },
      { id: 'p12', name: 'View Reports', code: 'reports.read', description: 'View financial reports', module: 'Finance', createdAt: new Date().toISOString() },
      { id: 'p13', name: 'Manage Payments', code: 'payments.manage', description: 'Manage payment records', module: 'Finance', createdAt: new Date().toISOString() },
      
      // Operations Module
      { id: 'p14', name: 'View Menu', code: 'menu.read', description: 'View menu items', module: 'Operations', createdAt: new Date().toISOString() },
      { id: 'p15', name: 'Manage Menu', code: 'menu.manage', description: 'Create, edit, delete menu items', module: 'Operations', createdAt: new Date().toISOString() },
      { id: 'p16', name: 'View Inventory', code: 'inventory.read', description: 'View inventory', module: 'Operations', createdAt: new Date().toISOString() },
      { id: 'p17', name: 'Manage Inventory', code: 'inventory.manage', description: 'Manage inventory items', module: 'Operations', createdAt: new Date().toISOString() },
      { id: 'p18', name: 'View Orders', code: 'orders.read', description: 'View orders', module: 'Operations', createdAt: new Date().toISOString() },
      { id: 'p19', name: 'Manage Orders', code: 'orders.manage', description: 'Create, edit, update orders', module: 'Operations', createdAt: new Date().toISOString() },
      { id: 'p20', name: 'View Production', code: 'production.read', description: 'View production schedule', module: 'Operations', createdAt: new Date().toISOString() },
      { id: 'p21', name: 'Manage Production', code: 'production.manage', description: 'Manage production schedule', module: 'Operations', createdAt: new Date().toISOString() },
      
      // Procurement Module
      { id: 'p22', name: 'View Procurement', code: 'procurement.read', description: 'View purchase orders', module: 'Procurement', createdAt: new Date().toISOString() },
      { id: 'p23', name: 'Manage Procurement', code: 'procurement.manage', description: 'Manage purchase orders', module: 'Procurement', createdAt: new Date().toISOString() },
    ];
    
    localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
    return permissions;
  }

  // Initialize default roles
  private initializeRoles(): Role[] {
    const allPermissionIds = this.getAllPermissions().map(p => p.id);
    
    const roles: Role[] = [
      {
        id: 'r1',
        name: 'Super Admin',
        code: 'super_admin',
        description: 'Full system access with all permissions',
        permissions: allPermissionIds,
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r2',
        name: 'Manager',
        code: 'manager',
        description: 'Manager with access to operations and reports',
        permissions: ['p1', 'p5', 'p7', 'p9', 'p12', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20', 'p21', 'p22', 'p23'],
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r3',
        name: 'HR Staff',
        code: 'hr_staff',
        description: 'HR department staff with employee and payroll access',
        permissions: ['p1', 'p5', 'p7', 'p8', 'p9', 'p10'],
        isSystemRole: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r4',
        name: 'Finance Staff',
        code: 'finance_staff',
        description: 'Finance department with payroll and payment access',
        permissions: ['p9', 'p10', 'p11', 'p12', 'p13'],
        isSystemRole: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r5',
        name: 'Kitchen Staff',
        code: 'kitchen_staff',
        description: 'Kitchen operations staff',
        permissions: ['p14', 'p16', 'p18', 'p19', 'p20'],
        isSystemRole: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'r6',
        name: 'Procurement Staff',
        code: 'procurement_staff',
        description: 'Procurement and purchasing staff',
        permissions: ['p16', 'p22', 'p23'],
        isSystemRole: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(roles));
    return roles;
  }

  getAllPermissions(): Permission[] {
    const stored = localStorage.getItem(this.PERMISSIONS_KEY);
    if (!stored) {
      return this.initializePermissions();
    }
    return JSON.parse(stored);
  }

  getPermissionsByModule(module: string): Permission[] {
    return this.getAllPermissions().filter(p => p.module === module);
  }

  getAll(): Role[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return this.initializeRoles();
    }
    return JSON.parse(stored);
  }

  getById(id: string): Role | undefined {
    return this.getAll().find(role => role.id === id);
  }

  create(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const roles = this.getAll();
    const newRole: Role = {
      ...roleData,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    roles.push(newRole);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(roles));
    return newRole;
  }

  update(id: string, updates: Partial<Omit<Role, 'id' | 'createdAt'>>): Role | null {
    const roles = this.getAll();
    const index = roles.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    // Prevent editing system roles' code and isSystemRole flag
    if (roles[index].isSystemRole) {
      delete updates.code;
      delete updates.isSystemRole;
    }
    
    roles[index] = {
      ...roles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(roles));
    return roles[index];
  }

  delete(id: string): boolean {
    const roles = this.getAll();
    const role = roles.find(r => r.id === id);
    
    // Prevent deleting system roles
    if (role?.isSystemRole) {
      return false;
    }
    
    const filtered = roles.filter(r => r.id !== id);
    if (filtered.length === roles.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  getRolePermissions(roleId: string): Permission[] {
    const role = this.getById(roleId);
    if (!role) return [];
    
    const allPermissions = this.getAllPermissions();
    return allPermissions.filter(p => role.permissions.includes(p.id));
  }

  hasPermission(roleId: string, permissionCode: string): boolean {
    const permissions = this.getRolePermissions(roleId);
    return permissions.some(p => p.code === permissionCode);
  }
}

export const roleService = new RoleService();
