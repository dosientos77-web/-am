import mongoose, { Schema, Document } from 'mongoose';
import { RestaurantStatus } from '../types';

export interface IRestaurant extends Document {
  name: string;
  description: string;
  logo: string;
  category: string;
  owner: mongoose.Types.ObjectId;
  status: RestaurantStatus;
  openingHours: string;
  location: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    logo: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(RestaurantStatus),
      default: RestaurantStatus.PENDING_APPROVAL,
    },
    openingHours: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

restaurantSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
