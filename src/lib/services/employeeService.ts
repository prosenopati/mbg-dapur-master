import { Employee } from '../types';

class EmployeeService {
  private readonly STORAGE_KEY = 'mbg_employees';

  private initializeEmployees(): Employee[] {
    const employees: Employee[] = [
      {
        id: 'emp1',
        employeeNumber: 'MBG-2023-001',
        fullName: 'Agus Susanto',
        email: 'agus.susanto@mbgdapur.com',
        phone: '081234567890',
        address: 'Jl. Raya Weleri No. 45, Weleri, Kendal',
        dateOfBirth: '1985-03-15',
        placeOfBirth: 'Kendal',
        idNumber: '3324031503850001',
        position: 'Kepala Dapur',
        department: 'Operations',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2023-01-15',
        bankName: 'Bank BRI',
        bankAccount: '0012-01-123456-50-9',
        accountHolderName: 'Agus Susanto',
        taxNumber: '12.345.678.9-012.000',
        emergencyContactName: 'Siti Susanto',
        emergencyContactPhone: '082345678901',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp2',
        employeeNumber: 'MBG-2023-002',
        fullName: 'Hendra Setiawan',
        email: 'hendra.setiawan@mbgdapur.com',
        phone: '082345678901',
        address: 'Jl. Kaliwungu Raya No. 12, Kaliwungu, Kendal',
        dateOfBirth: '1990-07-22',
        placeOfBirth: 'Kendal',
        idNumber: '3324072207900002',
        position: 'Driver/Kurir',
        department: 'Operations',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2023-02-01',
        bankName: 'Bank Mandiri',
        bankAccount: '1370-01-234567-89-0',
        accountHolderName: 'Hendra Setiawan',
        taxNumber: '23.456.789.0-123.000',
        emergencyContactName: 'Rini Setiawan',
        emergencyContactPhone: '083456789012',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp3',
        employeeNumber: 'MBG-2023-003',
        fullName: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@mbgdapur.com',
        phone: '083456789012',
        address: 'Jl. Patebon No. 78, Patebon, Kendal',
        dateOfBirth: '1992-05-10',
        placeOfBirth: 'Kendal',
        idNumber: '3324055005920001',
        position: 'HR Manager',
        department: 'HR',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2023-03-01',
        bankName: 'Bank BCA',
        bankAccount: '4560-123456',
        accountHolderName: 'Siti Nurhaliza',
        taxNumber: '34.567.890.1-234.000',
        emergencyContactName: 'Ahmad Nurhaliza',
        emergencyContactPhone: '084567890123',
        emergencyContactRelation: 'Suami',
        userId: 'u3',
        createdAt: new Date(Date.now() - 320 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp4',
        employeeNumber: 'MBG-2023-004',
        fullName: 'Wahyu Pratama',
        email: 'wahyu.pratama@mbgdapur.com',
        phone: '084567890123',
        address: 'Jl. Brangsong Indah No. 23, Brangsong, Kendal',
        dateOfBirth: '1988-11-30',
        placeOfBirth: 'Kendal',
        idNumber: '3324113011880003',
        position: 'Driver/Kurir',
        department: 'Operations',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2023-04-15',
        bankName: 'Bank BNI',
        bankAccount: '0987-654321',
        accountHolderName: 'Wahyu Pratama',
        taxNumber: '45.678.901.2-345.000',
        emergencyContactName: 'Dewi Pratama',
        emergencyContactPhone: '085678901234',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 290 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp5',
        employeeNumber: 'MBG-2023-005',
        fullName: 'Rudi Hermawan',
        email: 'rudi.hermawan@mbgdapur.com',
        phone: '085678901234',
        address: 'Jl. Cepiring No. 56, Cepiring, Kendal',
        dateOfBirth: '1987-09-18',
        placeOfBirth: 'Kendal',
        idNumber: '3324091809870004',
        position: 'Driver/Kurir',
        department: 'Operations',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2023-05-01',
        bankName: 'Bank BRI',
        bankAccount: '0012-01-789012-34-5',
        accountHolderName: 'Rudi Hermawan',
        taxNumber: '56.789.012.3-456.000',
        emergencyContactName: 'Sri Hermawan',
        emergencyContactPhone: '086789012345',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 260 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp6',
        employeeNumber: 'MBG-2024-001',
        fullName: 'Ahmad Wijaya',
        email: 'ahmad.wijaya@mbgdapur.com',
        phone: '086789012345',
        address: 'Jl. Kendal Permai No. 89, Kendal',
        dateOfBirth: '1991-02-14',
        placeOfBirth: 'Kendal',
        idNumber: '3324021402910005',
        position: 'Finance Manager',
        department: 'Finance',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2024-01-10',
        bankName: 'Bank Mandiri',
        bankAccount: '1370-01-345678-90-1',
        accountHolderName: 'Ahmad Wijaya',
        taxNumber: '67.890.123.4-567.000',
        emergencyContactName: 'Ani Wijaya',
        emergencyContactPhone: '087890123456',
        emergencyContactRelation: 'Istri',
        userId: 'u4',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp7',
        employeeNumber: 'MBG-2024-002',
        fullName: 'Dewi Lestari',
        phone: '087890123456',
        address: 'Jl. Pegandon No. 34, Pegandon, Kendal',
        dateOfBirth: '1993-08-25',
        placeOfBirth: 'Kendal',
        idNumber: '3324086508930006',
        position: 'Asisten Dapur',
        department: 'Operations',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2024-02-01',
        bankName: 'Bank BCA',
        bankAccount: '4560-234567',
        accountHolderName: 'Dewi Lestari',
        emergencyContactName: 'Budi Lestari',
        emergencyContactPhone: '088901234567',
        emergencyContactRelation: 'Suami',
        userId: 'u5',
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp8',
        employeeNumber: 'MBG-2024-003',
        fullName: 'Dwi Santoso',
        phone: '088901234567',
        address: 'Jl. Rowosari No. 67, Rowosari, Kendal',
        dateOfBirth: '1989-12-05',
        placeOfBirth: 'Kendal',
        idNumber: '3324120512890007',
        position: 'Driver/Kurir',
        department: 'Operations',
        employmentType: 'part-time',
        employmentStatus: 'active',
        joinDate: '2024-03-15',
        bankName: 'Bank BNI',
        bankAccount: '0987-765432',
        accountHolderName: 'Dwi Santoso',
        emergencyContactName: 'Rina Santoso',
        emergencyContactPhone: '089012345678',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp9',
        employeeNumber: 'MBG-2024-004',
        fullName: 'Tono Suprapto',
        phone: '089012345678',
        address: 'Jl. Weleri Tengah No. 12, Weleri, Kendal',
        dateOfBirth: '1994-04-20',
        placeOfBirth: 'Kendal',
        idNumber: '3324042004940008',
        position: 'Driver/Kurir',
        department: 'Operations',
        employmentType: 'part-time',
        employmentStatus: 'active',
        joinDate: '2024-05-01',
        bankName: 'Bank BRI',
        bankAccount: '0012-01-890123-45-6',
        accountHolderName: 'Tono Suprapto',
        emergencyContactName: 'Ratna Suprapto',
        emergencyContactPhone: '081345678901',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp10',
        employeeNumber: 'MBG-2024-005',
        fullName: 'Slamet Riyanto',
        phone: '081345678901',
        address: 'Jl. Kaliwungu Selatan No. 90, Kaliwungu, Kendal',
        dateOfBirth: '1986-06-12',
        placeOfBirth: 'Kendal',
        idNumber: '3324061206860009',
        position: 'Driver/Kurir',
        department: 'Operations',
        employmentType: 'contract',
        employmentStatus: 'active',
        joinDate: '2024-06-01',
        endDate: '2025-06-01',
        bankName: 'Bank Mandiri',
        bankAccount: '1370-01-456789-01-2',
        accountHolderName: 'Slamet Riyanto',
        emergencyContactName: 'Endang Riyanto',
        emergencyContactPhone: '082456789012',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'emp11',
        employeeNumber: 'MBG-2024-006',
        fullName: 'Budi Setiawan',
        phone: '082456789012',
        address: 'Jl. Patebon Timur No. 45, Patebon, Kendal',
        dateOfBirth: '1995-01-08',
        placeOfBirth: 'Kendal',
        idNumber: '3324010801950010',
        position: 'Driver/Kurir',
        department: 'Operations',
        employmentType: 'full-time',
        employmentStatus: 'active',
        joinDate: '2024-07-01',
        bankName: 'Bank BCA',
        bankAccount: '4560-345678',
        accountHolderName: 'Budi Setiawan',
        emergencyContactName: 'Wati Setiawan',
        emergencyContactPhone: '083567890123',
        emergencyContactRelation: 'Istri',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
    return employees;
  }

  getAll(): Employee[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return this.initializeEmployees();
    }
    return JSON.parse(stored);
  }

  getById(id: string): Employee | undefined {
    return this.getAll().find(emp => emp.id === id);
  }

  getByEmployeeNumber(employeeNumber: string): Employee | undefined {
    return this.getAll().find(emp => emp.employeeNumber === employeeNumber);
  }

  getByDepartment(department: string): Employee[] {
    return this.getAll().filter(emp => emp.department === department);
  }

  getByStatus(status: string): Employee[] {
    return this.getAll().filter(emp => emp.employmentStatus === status);
  }

  getActiveEmployees(): Employee[] {
    return this.getAll().filter(emp => emp.employmentStatus === 'active');
  }

  create(employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const employees = this.getAll();
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    employees.push(newEmployee);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
    return newEmployee;
  }

  update(id: string, updates: Partial<Omit<Employee, 'id' | 'createdAt'>>): Employee | null {
    const employees = this.getAll();
    const index = employees.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    employees[index] = {
      ...employees[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
    return employees[index];
  }

  delete(id: string): boolean {
    const employees = this.getAll();
    const filtered = employees.filter(e => e.id !== id);
    if (filtered.length === employees.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  generateEmployeeNumber(): string {
    const employees = this.getAll();
    const year = new Date().getFullYear();
    const yearEmployees = employees.filter(e => 
      e.employeeNumber.startsWith(`MBG-${year}`)
    );
    const nextNumber = yearEmployees.length + 1;
    return `MBG-${year}-${String(nextNumber).padStart(3, '0')}`;
  }
}

export const employeeService = new EmployeeService();
