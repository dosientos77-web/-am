import mongoose, { Schema, Document } from 'mongoose';
import { AuditAction } from '../types';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: AuditAction;
  entity: string;
  entityId: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
