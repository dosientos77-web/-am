import mongoose, { Schema, Document } from 'mongoose';
import { InventoryStatus } from '../types';

export interface IInventory extends Document {
  restaurant: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  stock: number;
  minimumStock: number;
  status: InventoryStatus;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minimumStock: { type: Number, required: true, min: 0, default: 5 },
    status: {
      type: String,
      enum: Object.values(InventoryStatus),
      default: InventoryStatus.AVAILABLE,
    },
  },
  { timestamps: true }
);

// Auto-update status based on stock
inventorySchema.pre('save', function (next) {
  if (this.stock === 0) {
    this.status = InventoryStatus.OUT_OF_STOCK;
  } else if (this.stock <= this.minimumStock) {
    this.status = InventoryStatus.LOW_STOCK;
  } else {
    this.status = InventoryStatus.AVAILABLE;
  }
  next();
});

inventorySchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
