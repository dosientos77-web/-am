import { AuditLog } from '../models/AuditLog';
import { AuditAction } from '../types';
import { User } from '../models/User';

export interface AuditInput {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async log(input: AuditInput): Promise<void> {
    await AuditLog.create({
      user: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata,
    });
  }

  async findAll(filters: { user?: string; action?: AuditAction; entity?: string } = {}) {
    const query: Record<string, unknown> = {};
    if (filters.user) query.user = filters.user;
    if (filters.action) query.action = filters.action;
    if (filters.entity) query.entity = filters.entity;

    return AuditLog.find(query).populate('user', 'name email').sort({ createdAt: -1 });
  }
}

export const auditService = new AuditService();
