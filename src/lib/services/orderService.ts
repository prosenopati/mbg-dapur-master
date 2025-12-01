import { Order, OrderStatus } from '../types';
import { StorageService } from './storage';

class OrderService extends StorageService<Order> {
  constructor() {
    super('mbg_orders');
    this.initializeSampleData();
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${dateStr}-${random}`;
  }

  private initializeSampleData() {
    if (this.getAll().length === 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const sampleOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-20241129-001',
          items: [
            { menuItemId: '1', menuItemName: 'Nasi Goreng Spesial', quantity: 180, price: 25000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 180, price: 5000 },
            { menuItemId: '6', menuItemName: 'Buah Potong', quantity: 180, price: 8000 },
          ],
          institutionName: 'SDN 1 Weleri',
          studentCount: 180,
          institutionAddress: 'Jl. Raya Weleri No. 45, Weleri, Kendal, Jawa Tengah',
          institutionContact: 'Ibu Siti Nurjanah - 081234567801',
          status: 'delivered',
          totalAmount: 6840000,
          notes: 'Makan siang untuk seluruh siswa kelas 1-6',
          courier: {
            name: 'Agus Susanto',
            phone: '082134567801',
            vehicleType: 'Mobil',
            vehicleNumber: 'G 1234 AK',
            assignedAt: new Date(today.getTime() - 7200000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-001',
          deliveryConfirmation: {
            receivedBy: 'Bapak Sukirman',
            position: 'Kepala Sekolah',
            receivedAt: new Date(today.getTime() - 3600000).toISOString(),
            notes: 'Pesanan diterima lengkap dan sesuai',
          },
          createdAt: new Date(today.getTime() - 10800000).toISOString(),
          updatedAt: new Date(today.getTime() - 3600000).toISOString(),
          completedAt: new Date(today.getTime() - 3600000).toISOString(),
        },
        {
          id: '2',
          orderNumber: 'ORD-20241129-002',
          items: [
            { menuItemId: '2', menuItemName: 'Soto Ayam', quantity: 250, price: 20000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 250, price: 5000 },
          ],
          institutionName: 'SMPN 1 Kaliwungu',
          studentCount: 250,
          institutionAddress: 'Jl. Soekarno-Hatta No. 88, Kaliwungu, Kendal, Jawa Tengah',
          institutionContact: 'Pak Bambang Wijaya - 081234567802',
          status: 'ready',
          totalAmount: 6250000,
          notes: 'Untuk acara perpisahan kelas 9',
          courier: {
            name: 'Hendra Setiawan',
            phone: '082134567802',
            vehicleType: 'Truk',
            vehicleNumber: 'G 5678 KD',
            assignedAt: new Date(today.getTime() - 1800000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-002',
          createdAt: new Date(today.getTime() - 5400000).toISOString(),
          updatedAt: new Date(today.getTime() - 1800000).toISOString(),
        },
        {
          id: '3',
          orderNumber: 'ORD-20241129-003',
          items: [
            { menuItemId: '5', menuItemName: 'Nasi Uduk', quantity: 320, price: 15000 },
            { menuItemId: '3', menuItemName: 'Gado-Gado', quantity: 320, price: 18000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 320, price: 5000 },
          ],
          institutionName: 'SMAN 1 Kendal',
          studentCount: 320,
          institutionAddress: 'Jl. Soekarno No. 17, Kendal, Jawa Tengah',
          institutionContact: 'Ibu Rina Handayani - 081234567803',
          status: 'delivered',
          totalAmount: 12160000,
          notes: 'Makan siang untuk siswa kelas 10, 11, 12',
          courier: {
            name: 'Wahyu Pratama',
            phone: '082134567803',
            vehicleType: 'Mobil',
            vehicleNumber: 'G 2345 KB',
            assignedAt: new Date(today.getTime() - 14400000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-003',
          deliveryConfirmation: {
            receivedBy: 'Ibu Sri Mulyani',
            position: 'Wakil Kepala Sekolah',
            receivedAt: new Date(today.getTime() - 10800000).toISOString(),
            notes: 'Semua pesanan diterima dengan baik',
          },
          createdAt: new Date(today.getTime() - 18000000).toISOString(),
          updatedAt: new Date(today.getTime() - 10800000).toISOString(),
          completedAt: new Date(today.getTime() - 10800000).toISOString(),
        },
        {
          id: '4',
          orderNumber: 'ORD-20241129-004',
          items: [
            { menuItemId: '1', menuItemName: 'Nasi Goreng Spesial', quantity: 150, price: 25000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 150, price: 5000 },
          ],
          institutionName: 'SDN 2 Patebon',
          studentCount: 150,
          institutionAddress: 'Jl. Raya Patebon No. 123, Patebon, Kendal, Jawa Tengah',
          institutionContact: 'Pak Joko Susilo - 081234567804',
          status: 'ready',
          totalAmount: 4500000,
          notes: 'Makan siang siswa SD',
          courier: {
            name: 'Rudi Hermawan',
            phone: '082134567804',
            vehicleType: 'Mobil',
            vehicleNumber: 'G 3456 KL',
            assignedAt: new Date(today.getTime() - 900000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-004',
          createdAt: new Date(today.getTime() - 3600000).toISOString(),
          updatedAt: new Date(today.getTime() - 900000).toISOString(),
        },
        {
          id: '5',
          orderNumber: 'ORD-20241129-005',
          items: [
            { menuItemId: '2', menuItemName: 'Soto Ayam', quantity: 200, price: 20000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 200, price: 5000 },
            { menuItemId: '6', menuItemName: 'Buah Potong', quantity: 200, price: 8000 },
          ],
          institutionName: 'SMPN 2 Brangsong',
          studentCount: 200,
          institutionAddress: 'Jl. Brangsong Raya No. 56, Brangsong, Kendal, Jawa Tengah',
          institutionContact: 'Ibu Endang Susilowati - 081234567805',
          status: 'delivered',
          totalAmount: 6600000,
          notes: 'Untuk kegiatan OSIS sekolah',
          courier: {
            name: 'Dwi Santoso',
            phone: '082134567805',
            vehicleType: 'Mobil',
            vehicleNumber: 'G 4567 KN',
            assignedAt: new Date(today.getTime() - 21600000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-005',
          deliveryConfirmation: {
            receivedBy: 'Bapak Hadi Purnomo',
            position: 'Pembina OSIS',
            receivedAt: new Date(today.getTime() - 18000000).toISOString(),
            notes: 'Pesanan sesuai dan tepat waktu',
          },
          createdAt: new Date(today.getTime() - 25200000).toISOString(),
          updatedAt: new Date(today.getTime() - 18000000).toISOString(),
          completedAt: new Date(today.getTime() - 18000000).toISOString(),
        },
        {
          id: '6',
          orderNumber: 'ORD-20241129-006',
          items: [
            { menuItemId: '5', menuItemName: 'Nasi Uduk', quantity: 95, price: 15000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 95, price: 5000 },
          ],
          institutionName: 'TK Dharma Wanita Pegandon',
          studentCount: 95,
          institutionAddress: 'Jl. Pegandon Indah No. 22, Pegandon, Kendal, Jawa Tengah',
          institutionContact: 'Ibu Ani Widodo - 081234567806',
          status: 'ready',
          totalAmount: 1900000,
          notes: 'Snack untuk acara pentas seni TK',
          courier: {
            name: 'Tono Suprapto',
            phone: '082134567806',
            vehicleType: 'Motor',
            vehicleNumber: 'G 6789 KP',
            assignedAt: new Date(today.getTime() - 600000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-006',
          createdAt: new Date(today.getTime() - 2700000).toISOString(),
          updatedAt: new Date(today.getTime() - 600000).toISOString(),
        },
        {
          id: '7',
          orderNumber: 'ORD-20241129-007',
          items: [
            { menuItemId: '1', menuItemName: 'Nasi Goreng Spesial', quantity: 280, price: 25000 },
            { menuItemId: '3', menuItemName: 'Gado-Gado', quantity: 280, price: 18000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 280, price: 5000 },
          ],
          institutionName: 'SDN 3 Cepiring',
          studentCount: 280,
          institutionAddress: 'Jl. Pendidikan No. 78, Cepiring, Kendal, Jawa Tengah',
          institutionContact: 'Pak Teguh Santoso - 081234567807',
          status: 'delivered',
          totalAmount: 13440000,
          notes: 'Makan siang untuk semua siswa dan guru',
          courier: {
            name: 'Budi Setiawan',
            phone: '082134567807',
            vehicleType: 'Truk',
            vehicleNumber: 'G 7890 KC',
            assignedAt: new Date(today.getTime() - 28800000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-007',
          deliveryConfirmation: {
            receivedBy: 'Ibu Dwi Rahayu',
            position: 'Kepala Sekolah',
            receivedAt: new Date(today.getTime() - 25200000).toISOString(),
            notes: 'Terima kasih, makanan sangat enak',
          },
          createdAt: new Date(today.getTime() - 32400000).toISOString(),
          updatedAt: new Date(today.getTime() - 25200000).toISOString(),
          completedAt: new Date(today.getTime() - 25200000).toISOString(),
        },
        {
          id: '8',
          orderNumber: 'ORD-20241129-008',
          items: [
            { menuItemId: '2', menuItemName: 'Soto Ayam', quantity: 175, price: 20000 },
            { menuItemId: '4', menuItemName: 'Es Teh Manis', quantity: 175, price: 5000 },
          ],
          institutionName: 'SMPN 1 Rowosari',
          studentCount: 175,
          institutionAddress: 'Jl. Rowosari Utara No. 34, Rowosari, Kendal, Jawa Tengah',
          institutionContact: 'Ibu Retno Wulandari - 081234567808',
          status: 'ready',
          totalAmount: 4375000,
          notes: 'Untuk acara bakti sosial sekolah',
          courier: {
            name: 'Slamet Riyanto',
            phone: '082134567808',
            vehicleType: 'Mobil',
            vehicleNumber: 'G 8901 KR',
            assignedAt: new Date(today.getTime() - 1200000).toISOString(),
          },
          deliveryNoteNumber: 'SJ-20241129-008',
          createdAt: new Date(today.getTime() - 4500000).toISOString(),
          updatedAt: new Date(today.getTime() - 1200000).toISOString(),
        },
      ];

      sampleOrders.forEach(order => this.create(order));
    }
  }

  createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.create(newOrder);
  }

  updateStatus(id: string, status: OrderStatus): Order | null {
    const updates: any = { status };
    
    if (status === 'delivered') {
      updates.completedAt = new Date().toISOString();
    }

    return this.update(id, updates);
  }

  getByStatus(status: OrderStatus): Order[] {
    return this.getAll().filter(order => order.status === status);
  }

  getTodayOrders(): Order[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.getAll().filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  }

  getPendingOrders(): Order[] {
    return this.getByStatus('pending');
  }

  getRevenueByDateRange(startDate: Date, endDate: Date): number {
    return this.getAll()
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate && order.status === 'delivered';
      })
      .reduce((total, order) => total + order.totalAmount, 0);
  }
}

export const orderService = new OrderService();