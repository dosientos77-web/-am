import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus, DeliveryType } from '../types';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  pickupTime?: string;
  status: OrderStatus;
  delivery?: mongoose.Types.ObjectId;
  deliveryCode?: string;
  payment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryType: {
      type: String,
      enum: Object.values(DeliveryType),
      default: DeliveryType.PICKUP,
    },
    deliveryAddress: { type: String, default: '' },
    pickupTime: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    delivery: { type: Schema.Types.ObjectId, ref: 'Delivery' },
    deliveryCode: { type: String, default: '' },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
