import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { Inventory } from '../models/Inventory';
import { Payment } from '../models/Payment';
import { Restaurant } from '../models/Restaurant';
import { ApiError } from '../utils/ApiError';
import { OrderStatus, DeliveryType, UserRole } from '../types';

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
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER';
}

export class OrderService {
  async create(input: CreateOrderInput): Promise<IOrder> {
    if (!input.restaurant || !input.items?.length) {
      throw new ApiError(400, 'Restaurant and at least one item are required');
    }

    if (input.deliveryType === DeliveryType.DELIVERY && !input.deliveryAddress?.trim()) {
      throw new ApiError(400, 'Delivery address is required for delivery orders');
    }

    const restaurant = await Restaurant.findById(input.restaurant);
    if (!restaurant || restaurant.status !== 'ACTIVE') {
      throw new ApiError(400, 'Restaurant is not available');
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of input.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new ApiError(400, 'Each item quantity must be at least 1');
      }

      const product = await Product.findById(item.product);
      if (!product) throw new ApiError(404, `Product ${item.product} not found`);
      if (product.restaurant.toString() !== input.restaurant) {
        throw new ApiError(400, 'All products must belong to the selected restaurant');
      }
      if (!product.available) throw new ApiError(400, `Product ${product.name} is not available`);

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
    const deliveryCode = input.deliveryType === DeliveryType.DELIVERY
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : undefined;

    const order = await Order.create({
      customer: input.customer,
      restaurant: input.restaurant,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryType: input.deliveryType,
      deliveryAddress: input.deliveryAddress?.trim() || '',
      pickupTime: input.pickupTime?.trim() || '',
      status: OrderStatus.PENDING,
      deliveryCode,
    });

    const payment = await Payment.create({
      order: order._id,
      amount: total,
      method: input.paymentMethod || 'CASH',
      status: input.paymentMethod === 'CARD' || input.paymentMethod === 'TRANSFER' ? 'COMPLETED' : 'PENDING',
      transactionId: input.paymentMethod === 'CARD' || input.paymentMethod === 'TRANSFER'
        ? `SIM-${Date.now()}`
        : undefined,
    });

    order.payment = payment._id;
    await order.save();

    for (const item of input.items) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { stock: -item.quantity } }
      );
    }

    return order;
  }

  async findAll(
    filters: { customer?: string; restaurant?: string; status?: OrderStatus } = {},
    requester?: { userId: string; role: UserRole }
  ): Promise<IOrder[]> {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;

    if (requester?.role === UserRole.CUSTOMER) {
      query.customer = requester.userId;
    } else if (requester?.role === UserRole.RESTAURANT) {
      const restaurants = await Restaurant.find({ owner: requester.userId }).select('_id');
      query.restaurant = { $in: restaurants.map((r) => r._id) };
    } else if (requester?.role === UserRole.DELIVERY) {
      query.deliveryType = DeliveryType.DELIVERY;
      query.status = filters.status || { $in: [OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY] };
    } else {
      if (filters.customer) query.customer = filters.customer;
      if (filters.restaurant) query.restaurant = filters.restaurant;
    }

    return Order.find(query).sort({ createdAt: -1 });
  }

  async findById(id: string, requester?: { userId: string; role: UserRole }): Promise<IOrder> {
    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .populate('restaurant', 'name owner')
      .populate('items.product', 'name image')
      .populate('payment');

    if (!order) throw new ApiError(404, 'Order not found');

    if (requester && requester.role !== UserRole.ADMIN) {
      const customerId = typeof order.customer === 'object' && order.customer && '_id' in order.customer
        ? String((order.customer as any)._id)
        : String(order.customer);
      const restaurantOwner = typeof order.restaurant === 'object' && order.restaurant && 'owner' in order.restaurant
        ? String((order.restaurant as any).owner)
        : '';

      const allowed =
        (requester.role === UserRole.CUSTOMER && customerId === requester.userId) ||
        (requester.role === UserRole.RESTAURANT && restaurantOwner === requester.userId) ||
        requester.role === UserRole.DELIVERY;

      if (!allowed) throw new ApiError(403, 'Not authorized to view this order');
    }

    return order;
  }

  async updateStatus(
    id: string,
    newStatus: OrderStatus,
    requesterRole: UserRole
  ): Promise<IOrder> {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    const currentStatus = order.status as OrderStatus;
    const validNextStates = VALID_TRANSITIONS[currentStatus];
    if (!validNextStates.includes(newStatus)) {
      throw new ApiError(400, `Cannot transition from ${currentStatus} to ${newStatus}`);
    }

    if (requesterRole === UserRole.RESTAURANT) {
      const allowedFromRestaurant = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY];
      if (
        newStatus === OrderStatus.DELIVERED &&
        order.deliveryType === DeliveryType.PICKUP &&
        currentStatus === OrderStatus.READY
      ) {
        // Allowed
      } else if (!allowedFromRestaurant.includes(newStatus)) {
        throw new ApiError(403, 'Restaurant cannot perform this action');
      }
    }

    if (requesterRole === UserRole.DELIVERY && newStatus !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new ApiError(403, 'Delivery staff must confirm delivery with the customer code');
    }

    order.status = newStatus;
    await order.save();
    return order;
  }

  async cancel(id: string, requesterId: string, requesterRole: UserRole): Promise<IOrder> {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, 'Order not found');

    if (requesterRole !== UserRole.ADMIN && order.customer.toString() !== requesterId) {
      throw new ApiError(403, 'Not authorized to cancel this order');
    }

    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status as OrderStatus)) {
      throw new ApiError(400, `Cannot cancel order with status ${order.status}`);
    }

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
    if (order.deliveryType !== DeliveryType.DELIVERY) {
      throw new ApiError(400, 'This order is not a delivery order');
    }
    if (order.deliveryCode !== code.trim()) {
      throw new ApiError(400, 'Invalid delivery code');
    }
    if (order.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new ApiError(400, `Cannot deliver order with status ${order.status}`);
    }

    order.status = OrderStatus.DELIVERED;
    await order.save();
    return order;
  }
}

export const orderService = new OrderService();
