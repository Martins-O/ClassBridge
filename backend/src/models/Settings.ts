import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  userId: string;
  general: {
    systemName: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  notifications: {
    emailNotifications: boolean;
    approvalAlerts: boolean;
    registrationAlerts: boolean;
    dailyDigest: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: { type: String, required: true, unique: true },
    general: {
      systemName: { type: String, default: 'ClassBridge' },
      timezone: { type: String, default: 'UTC' },
      language: { type: String, default: 'en' },
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      approvalAlerts: { type: Boolean, default: true },
      registrationAlerts: { type: Boolean, default: true },
      dailyDigest: { type: Boolean, default: false },
    },
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
      passwordExpiry: { type: Number, default: 90 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
