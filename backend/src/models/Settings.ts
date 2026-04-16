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
  passwordRotation: {
    enabled: boolean;
    maxAgeDays: number;
    reminder1Days: number;
    reminder2Days: number;
    gracePeriodDays: number;
    maxRemindersIgnored: number;
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
    passwordRotation: {
      enabled: { type: Boolean, default: true },
      maxAgeDays: { type: Number, default: 90 },
      reminder1Days: { type: Number, default: 60 },
      reminder2Days: { type: Number, default: 80 },
      gracePeriodDays: { type: Number, default: 0 },
      maxRemindersIgnored: { type: Number, default: 3 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
