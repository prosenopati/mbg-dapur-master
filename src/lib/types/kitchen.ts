// Kitchen/Dapur entity types

export interface Kitchen {
  id: string;
  code: string;
  name: string;
  location: string;
  address: string;
  managerId?: string;
  managerName?: string;
  phone?: string;
  email?: string;
  capacity?: number; // meals per day
  operatingHours?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
