import mongoose, { Schema, Document } from 'mongoose';

export interface IMetricsHistory extends Document {
  timestamp: Date;
  memoryUsed: number;
  memoryTotal: number;
  heapUsed: number;
  heapTotal: number;
  cpuLoad: number[];
  activeConnections: number;
  requestsCount: number;
  uptime: number;
}

const MetricsHistorySchema = new Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  memoryUsed: { type: Number, required: true },
  memoryTotal: { type: Number, required: true },
  heapUsed: { type: Number, required: true },
  heapTotal: { type: Number, required: true },
  cpuLoad: [{ type: Number }],
  activeConnections: { type: Number, default: 0 },
  requestsCount: { type: Number, default: 0 },
  uptime: { type: Number, required: true },
}, {
  timestamps: true,
});

MetricsHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.models.MetricsHistory || mongoose.model<IMetricsHistory>('MetricsHistory', MetricsHistorySchema);
