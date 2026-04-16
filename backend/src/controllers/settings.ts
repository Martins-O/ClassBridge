import { Request, Response } from 'express';
import connectDB from '../lib/mongodb';
import Settings from '../models/Settings';
import { getUserIdFromRequest } from '../lib/session';

const DEFAULT_SETTINGS = {
  general: {
    systemName: 'ClassBridge',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  },
  notifications: {
    emailNotifications: true,
    approvalAlerts: true,
    registrationAlerts: true,
    dailyDigest: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
  },
};

export async function getSettings(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let settings = await Settings.findOne({ userId });

    if (!settings) {
      settings = await Settings.create({
        userId,
        ...DEFAULT_SETTINGS,
      });
    }

    return res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    await connectDB();

    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { general, notifications, security } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(general && { general }),
          ...(notifications && { notifications }),
          ...(security && { security }),
        },
      },
      { new: true, upsert: true }
    );

    return res.json({ settings, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
}
