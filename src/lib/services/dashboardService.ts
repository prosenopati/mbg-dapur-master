import { DashboardMetrics } from '../types';
import { orderService } from './orderService';
import { inventoryService } from './inventoryService';

class DashboardService {
  getMetrics(): DashboardMetrics {
    const todayOrders = orderService.getTodayOrders();
    const pendingOrders = orderService.getPendingOrders();
    const lowStockItems = inventoryService.getLowStockItems();
    
    const completedToday = todayOrders.filter(o => o.status === 'delivered');
    const totalRevenue = completedToday.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const todayMeals = todayOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    return {
      dailyOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      lowStockItems: lowStockItems.length,
      todayMeals,
      completedOrders: completedToday.length,
    };
  }

  getRecentActivity() {
    const recentOrders = orderService.getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return recentOrders.map(order => ({
      id: order.id,
      type: 'order' as const,
      title: `Order ${order.orderNumber}`,
      description: `${order.items.length} items - ${order.status}`,
      timestamp: order.createdAt,
      status: order.status,
    }));
  }
}

export const dashboardService = new DashboardService();
