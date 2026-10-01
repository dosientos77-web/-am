import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  name: string;
  description: string;
  discount: number;
  type: 'PERCENTAGE' | 'FIXED';
  startDate: Date;
  endDate: Date;
  active: boolean;
  restaurant?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    discount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'PERCENTAGE' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  },
  { timestamps: true }
);

promotionSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
