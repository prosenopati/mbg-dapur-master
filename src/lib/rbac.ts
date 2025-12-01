// Role-Based Access Control (RBAC) Configuration

export type UserRole = "Admin" | "Manager" | "Dapur" | "Keuangan" | "Supplier";

export interface RolePermissions {
  role: UserRole;
  allowedRoutes: string[];
  description: string;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  Admin: {
    role: "Admin",
    allowedRoutes: [
      "/dashboard",
      "/dashboard/menu",
      "/dashboard/inventory",
      "/dashboard/orders",
      "/dashboard/production",
      "/dashboard/procurement",
      "/dashboard/receiving",
      "/dashboard/hr/employees",
      "/dashboard/hr/users",
      "/dashboard/hr/roles",
      "/dashboard/finance/payroll",
      "/dashboard/payments",
      "/dashboard/financial",
      "/dashboard/settings",
      "/dashboard/settings/users",
      "/dashboard/settings/roles",
      "/dashboard/settings/credentials",
      "/dashboard/profile",
    ],
    description: "Full access ke semua modul sistem"
  },
  Manager: {
    role: "Manager",
    allowedRoutes: [
      "/dashboard",
      "/dashboard/menu",
      "/dashboard/inventory",
      "/dashboard/orders",
      "/dashboard/production",
      "/dashboard/procurement",
      "/dashboard/receiving",
      "/dashboard/hr/employees",
      "/dashboard/finance/payroll",
      "/dashboard/payments",
      "/dashboard/financial",
      "/dashboard/profile",
    ],
    description: "Semua fitur kecuali Pengaturan"
  },
  Dapur: {
    role: "Dapur",
    allowedRoutes: [
      "/dashboard/menu",
      "/dashboard/orders",
      "/dashboard/procurement",
      "/dashboard/receiving",
      "/dashboard/production",
      "/dashboard/profile",
    ],
    description: "Akses Menu Plan, Orders, Purchase Order, Receiving, Production"
  },
  Keuangan: {
    role: "Keuangan",
    allowedRoutes: [
      "/dashboard/financial",
      "/dashboard/payments",
      "/dashboard/finance/payroll",
      "/dashboard/profile",
    ],
    description: "Akses Financial Reports, Payments, dan Payroll"
  },
  Supplier: {
    role: "Supplier",
    allowedRoutes: [
      "/dashboard/procurement",
      "/dashboard/profile",
    ],
    description: "Akses Purchase Orders dan History"
  }
};

export function getUserRole(): UserRole {
  if (typeof window === "undefined") return "Admin";
  return (localStorage.getItem("user_role") as UserRole) || "Admin";
}

export function getUserEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("user_email") || "";
}

export function hasAccess(route: string): boolean {
  const role = getUserRole();
  const permissions = rolePermissions[role];
  
  // Check exact match first
  if (permissions.allowedRoutes.includes(route)) {
    return true;
  }
  
  // Check if any allowed route is a parent of the current route
  return permissions.allowedRoutes.some(allowedRoute => 
    route.startsWith(allowedRoute)
  );
}

export function filterNavigationByRole(navGroups: any[]): any[] {
  const role = getUserRole();
  const permissions = rolePermissions[role];
  
  return navGroups
    .map(group => ({
      ...group,
      items: group.items.filter((item: any) => 
        permissions.allowedRoutes.includes(item.href) ||
        permissions.allowedRoutes.some(route => item.href.startsWith(route))
      )
    }))
    .filter(group => group.items.length > 0);
}

export function getRoleInfo(role: UserRole) {
  return rolePermissions[role];
}
