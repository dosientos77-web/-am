import mongoose, { Schema, Document } from 'mongoose';

export interface IDelivery extends Document {
  order: mongoose.Types.ObjectId;
  deliveryPerson: mongoose.Types.ObjectId;
  status: string;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deliverySchema = new Schema<IDelivery>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryPerson: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['ASSIGNED', 'PICKED_UP', 'DELIVERED'], default: 'ASSIGNED' },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

deliverySchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Delivery = mongoose.model<IDelivery>('Delivery', deliverySchema);
