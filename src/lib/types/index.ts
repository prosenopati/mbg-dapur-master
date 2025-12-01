// TypeScript interfaces mirroring future Prisma schema structure
// These can be directly converted to Prisma models

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';
export type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'beverage';
export type PayrollSchedule = 'daily' | 'weekly' | 'monthly' | 'custom';
export type PayrollStatus = 'pending' | 'processed' | 'paid' | 'cancelled';
export type EmploymentStatus = 'active' | 'inactive' | 'terminated' | 'on-leave';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'temporary';

// Menu Plan Types
export type MenuPlanStatus = 'draft' | 'confirmed' | 'production' | 'portioning' | 'delivery' | 'completed' | 'cancelled';
export type TargetGroup = 'TK' | 'SD' | 'SMP' | 'SMA' | 'UMUM';
export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
export type IngredientCategory = 'Karbohidrat' | 'Protein Hewani' | 'Protein Nabati' | 'Sayur' | 'Buah' | 'Bumbu' | 'Lainnya';

export interface MenuPlanIngredient {
  id: string;
  category: IngredientCategory;
  productName: string;
  plannedQty: number;
  unit: string;
  notes?: string;
  conversionInfo?: string; // e.g., "Qty 566000.0 gram dikonversi ke kg"
}

export interface MenuPlan {
  id: string;
  planCode: string; // e.g., MNU/25.10/0001
  masterMenu: string; // Combined menu items like "Nasi+Orek Tempe+Sayur Labu siam+Ayam Goreng"
  targetGroup: TargetGroup;
  date: string; // ISO date
  dayOfWeek: DayOfWeek;
  portionCount: number; // Jumlah Porsi
  status: MenuPlanStatus;
  ingredients: MenuPlanIngredient[];
  notes?: string;
  
  // Workflow tracking
  confirmedAt?: string;
  confirmedBy?: string;
  productionStartedAt?: string;
  portioningStartedAt?: string;
  deliveryStartedAt?: string;
  completedAt?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// HR & User Management Types
export interface Permission {
  id: string;
  name: string;
  code: string; // e.g., 'users.create', 'orders.read', 'payroll.process'
  description: string;
  module: string; // e.g., 'HR', 'Finance', 'Operations'
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string; // e.g., 'admin', 'manager', 'staff'
  description: string;
  permissions: string[]; // Permission IDs
  isSystemRole: boolean; // Cannot be deleted if true
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  roleName?: string; // Denormalized for display
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  employeeNumber: string; // NIK/Employee ID
  fullName: string;
  email?: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  placeOfBirth: string;
  idNumber: string; // KTP number
  
  // Employment Details
  position: string;
  department: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  joinDate: string;
  endDate?: string;
  
  // Payroll Information
  bankName?: string;
  bankAccount?: string;
  accountHolderName?: string;
  taxNumber?: string; // NPWP
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  userId?: string; // Link to User account if they have system access
  createdAt: string;
  updatedAt: string;
}

export interface PayrollItem {
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  position: string;
  amount: number;
  notes?: string;
}

export interface Payroll {
  id: string;
  payrollNumber: string; // e.g., PAY-2024-001
  title: string; // e.g., "Gaji Bulanan Januari 2024"
  schedule: PayrollSchedule;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  paymentDate: string; // ISO date
  status: PayrollStatus;
  items: PayrollItem[];
  totalAmount: number;
  notes?: string;
  processedBy?: string; // User ID who processed
  processedAt?: string;
  createdBy: string; // User ID who created
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // minutes
  ingredients: string[]; // IDs of inventory items
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string; // kg, pcs, liters, etc.
  minimumStock: number;
  status: InventoryStatus;
  supplier?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourierInfo {
  name: string;
  phone: string;
  vehicleType?: string; // Motor, Mobil, Sepeda
  vehicleNumber?: string;
  assignedAt: string;
}

export interface DeliveryConfirmation {
  receivedBy: string; // Name of person receiving
  receivedAt: string; // ISO datetime
  position?: string; // Position/title at school
  signatureUrl?: string; // URL to signature image
  photoUrl?: string; // URL to delivery photo
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  
  // Customer/Institution Information
  customerName?: string;
  customerPhone?: string;
  
  // School/Institution specific
  institutionName?: string; // Nama Lembaga/Sekolah
  studentCount?: number; // Jumlah siswa yang menerima
  institutionAddress?: string;
  institutionContact?: string; // Contact person at institution
  
  // Delivery Information
  courier?: CourierInfo; // Petugas pengantar
  deliveryNoteNumber?: string; // Nomor surat jalan
  deliveryConfirmation?: DeliveryConfirmation; // Konfirmasi penerimaan
  
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  scheduledFor?: string; // ISO datetime for scheduled orders
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface KitchenSchedule {
  id: string;
  date: string; // ISO date
  shift: 'morning' | 'afternoon' | 'evening';
  staffMembers: string[];
  plannedOrders: string[]; // Order IDs
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  dailyOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockItems: number;
  todayMeals: number;
  completedOrders: number;
}