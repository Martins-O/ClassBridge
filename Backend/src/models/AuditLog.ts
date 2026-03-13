import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    userEmail: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import'],
        index: true
    },
    resource: {
        type: String,
        required: true,
        index: true
    },
    resourceId: {
        type: String,
        index: true
    },
    details: {
        type: Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, action: 1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
