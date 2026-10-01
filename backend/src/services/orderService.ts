import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { ApiError } from '../utils/ApiError';
import { OrderStatus, DeliveryType, UserRole } from '../types';

// Valid state transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export interface CreateOrderInput {
  customer: string;
  restaurant: string;
  items: { product: string; quantity: number }[];
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  pickupTime?: string;
}

export class OrderService {
  async create(input: CreateOrderInput): Promise<IOrder> {
    // Validate products and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of input.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new ApiError(404, `Product ${item.product} not found`);
      }
      if (!product.available) {
        throw new ApiError(400, `Product ${product.name} is not available`);
      }

      // Check inventory
      const inventory = await Inventory.findOne({ product: product._id });
      if (inventory && inventory.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      subtotal += product.price * item.quantity;
    }

    const deliveryFee = input.deliveryType === DeliveryType.DELIVERY ? 2.99 : 0;
    const total = subtotal + deliveryFee;

    // Generate delivery code for delivery orders
    const deliveryCode = input.deliveryType === DeliveryType.DELIVERY
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : undefined;

    const order = await Order.create({
      customer: input.customer,
      restaurant: input.restaurant,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryType: input.deliveryType,
      deliveryAddress: input.deliveryAddress || '',
      pickupTime: input.pickupTime || '',
      status: OrderStatus.PENDING,
      deliveryCode,
    });

    // Deduct inventory
    for (const item of input.items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { stock: -item.quantity } }
      );
    }

    return order;
  }

  async findAll(filters: { customer?: string; restaurant?: string; status?: OrderStatus } = {}): Promise<IOrder[]> {
    const query: Record<string, unknown> = {};
    if (filters.customer) query.customer = filters.customer;
    if (filters.restaurant) query.restaurant = filters.restaurant;
    if (filters.status) query.status = filters.status;

    return Order.find(query).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IOrder> {
    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .populate('items.product', 'name image');
    if (!order) throw new ApiError(404, 'Order not found');
    return order;
  }

  async updateStatus(id: string, newStatus: OrderStatus, requesterRole: UserRole): Promise<IOrder> {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    // Validate transition
    const currentStatus = order.status as OrderStatus;
    const validNextStates = VALID_TRANSITIONS[currentStatus];
    if (!validNextStates.includes(newStatus)) {
      throw new ApiError(400, `Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    // Role-based permissions for status changes
    if (requesterRole === UserRole.RESTAURANT) {
      const allowedFromRestaurant = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY];
      // Restaurant can mark PICKUP orders as DELIVERED when READY
      if (newStatus === OrderStatus.DELIVERED && order.deliveryType === DeliveryType.PICKUP && currentStatus === OrderStatus.READY) {
        // Allowed
      } else if (!allowedFromRestaurant.includes(newStatus)) {
        throw new ApiError(403, 'Restaurant cannot perform this action');
      }
    }

    order.status = newStatus;
    await order.save();
    return order;
  }

  async cancel(id: string, requesterId: string, requesterRole: UserRole): Promise<IOrder> {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    // Only customer who owns the order or admin can cancel
    if (requesterRole !== UserRole.ADMIN && order.customer.toString() !== requesterId) {
      throw new ApiError(403, 'Not authorized to cancel this order');
    }

    // Can only cancel from PENDING or CONFIRMED
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status as OrderStatus)) {
      throw new ApiError(400, `Cannot cancel order with status ${order.status}`);
    }

    // Restore inventory
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = OrderStatus.CANCELLED;
    await order.save();
    return order;
  }

  async confirmDelivery(id: string, code: string): Promise<IOrder> {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    if (order.deliveryCode !== code) {
      throw new ApiError(400, 'Invalid delivery code');
    }

    if (order.status !== OrderStatus.READY && order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new ApiError(400, `Cannot deliver order with status ${order.status}`);
    }

    order.status = OrderStatus.DELIVERED;
    await order.save();
    return order;
  }
}

export const orderService = new OrderService();
