import { Order } from '../models/Order';
import { Restaurant } from '../models/Restaurant';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';

export class ReportService {
  async getDashboardStats() {
    const [totalUsers, totalRestaurants, totalOrders, totalProducts, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);

    return {
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }

  async getSalesReport(filters: { startDate?: Date; endDate?: Date; restaurant?: string } = {}) {
    const query: Record<string, unknown> = {};
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) (query.createdAt as Record<string, Date>).$gte = filters.startDate;
      if (filters.endDate) (query.createdAt as Record<string, Date>).$lte = filters.endDate;
    }
    if (filters.restaurant) query.restaurant = filters.restaurant;

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { totalSales, totalOrders, averageOrder, orders };
  }

  async getInventoryReport(restaurantId?: string) {
    const query: Record<string, unknown> = {};
    if (restaurantId) query.restaurant = restaurantId;

    const inventory = await Inventory.find(query).populate('product', 'name');

    const lowStock = inventory.filter((i) => i.status === 'LOW_STOCK').length;
    const outOfStock = inventory.filter((i) => i.status === 'OUT_OF_STOCK').length;
    const available = inventory.filter((i) => i.status === 'AVAILABLE').length;

    return { total: inventory.length, lowStock, outOfStock, available, inventory };
  }

  async getTopRestaurants(limit = 5) {
    const restaurants = await Restaurant.find({ status: 'ACTIVE' })
      .limit(limit)
      .sort({ createdAt: -1 });

    const stats = await Promise.all(
      restaurants.map(async (r) => {
        const orders = await Order.find({ restaurant: r._id });
        const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
        return { restaurant: r, totalOrders: orders.length, totalSales };
      })
    );

    return stats.sort((a, b) => b.totalSales - a.totalSales);
  }
}

export const reportService = new ReportService();
