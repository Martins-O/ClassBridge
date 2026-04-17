import nodeCron from 'node-cron';
import connectDB from './mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import School from '@/models/School';
import Settings from '@/models/Settings';
import RefreshToken from '@/models/RefreshToken';
import { systemService } from '@/services/system.service';
import { sendEmail, generateDailyDigestEmail, DailyDigestData, generatePasswordExpiryEmail, generatePasswordExpiryWarningEmail } from '@/lib/email';

async function sendDailyDigestEmails() {
  try {
    await connectDB();

    const users = await User.find({ role: { $in: ['school_admin', 'mentor'] } })
      .populate('school', 'name')
      .lean();

    for (const user of users) {
      if (!user.school) continue;

      const userId = String(user._id);
      const userSettings = await Settings.findOne({ userId: userId });
      if (userSettings?.notifications?.dailyDigest === false) continue;

      const school = user.school as unknown as { name: string };
      const unreadNotifications = await Notification.find({
        userId: userId,
        isRead: false,
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }).lean();

      const unreadCount = await Notification.countDocuments({
        userId: userId,
        isRead: false
      });

      if (unreadCount === 0) continue;

      const digestData: DailyDigestData = {
        recipientEmail: user.email,
        recipientName: user.name,
        schoolName: school.name,
        notifications: unreadNotifications.map(n => ({
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          createdAt: n.createdAt
        })),
        unreadCount
      };

      const email = generateDailyDigestEmail(digestData);
      await sendEmail(email);
    }

    console.log('Daily digest emails sent successfully');
  } catch (error) {
    console.error('Error sending daily digest emails:', error);
  }
}

async function processPasswordRotation() {
  try {
    await connectDB();

    const systemSettings = await Settings.findOne();
    const rotationConfig = systemSettings?.passwordRotation || {
      enabled: true,
      maxAgeDays: 90,
      reminder1Days: 60,
      reminder2Days: 80,
      gracePeriodDays: 0,
      maxRemindersIgnored: 3,
    };

    if (!rotationConfig.enabled) {
      return;
    }

    const activeUsers = await User.find({ isActive: true, role: { $ne: 'system_admin' } }).lean();

    for (const user of activeUsers) {
      const userId = (user._id as any).toString();
      const passwordChangedAt = user.passwordChangedAt ? new Date(user.passwordChangedAt) : new Date(user.createdAt);
      const daysSinceChange = Math.floor((Date.now() - passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24));
      const remindersSent = user.remindersSent || 0;

      if (user.passwordExpired && remindersSent >= rotationConfig.maxRemindersIgnored) {
        await User.findByIdAndUpdate(userId, { isActive: false });
        await RefreshToken.deleteMany({ userId });
        
        await Notification.create({
          userId,
          title: 'Account Locked',
          message: 'Your account has been locked due to ignored password expiration reminders. Please contact your administrator.',
          type: 'error',
        });

        continue;
      }

      if (daysSinceChange >= rotationConfig.maxAgeDays && !user.passwordExpired) {
        await User.findByIdAndUpdate(userId, {
          passwordExpired: true,
          remindersSent: 0,
        });
        await RefreshToken.deleteMany({ userId });

        await Notification.create({
          userId,
          title: 'Password Expired',
          message: 'Your password has expired. You must change it before you can log in again.',
          type: 'error',
        });

        try {
          const email = generatePasswordExpiryEmail({
            recipientEmail: user.email,
            recipientName: user.name,
          });
          await sendEmail(email);
        } catch (emailError) {
          console.error('Failed to send password expiry email:', emailError);
        }

        continue;
      }

      if (daysSinceChange >= rotationConfig.reminder2Days && remindersSent < 2) {
        await User.findByIdAndUpdate(userId, { remindersSent: 2 });

        await Notification.create({
          userId,
          title: 'Password Expiring Soon',
          message: `Urgent: Your password will expire in ${rotationConfig.maxAgeDays - daysSinceChange} days. Please change it.`,
          type: 'warning',
        });

        try {
          const email = generatePasswordExpiryWarningEmail({
            recipientEmail: user.email,
            recipientName: user.name,
            daysRemaining: rotationConfig.maxAgeDays - daysSinceChange,
            isUrgent: true,
          });
          await sendEmail(email);
        } catch (emailError) {
          console.error('Failed to send urgent reminder email:', emailError);
        }

        continue;
      }

      if (daysSinceChange >= rotationConfig.reminder1Days && remindersSent < 1) {
        await User.findByIdAndUpdate(userId, { remindersSent: 1 });

        await Notification.create({
          userId,
          title: 'Password Reminder',
          message: `Your password will expire in ${rotationConfig.maxAgeDays - daysSinceChange} days. Please consider changing it.`,
          type: 'info',
        });

        try {
          const email = generatePasswordExpiryWarningEmail({
            recipientEmail: user.email,
            recipientName: user.name,
            daysRemaining: rotationConfig.maxAgeDays - daysSinceChange,
            isUrgent: false,
          });
          await sendEmail(email);
        } catch (emailError) {
          console.error('Failed to send reminder email:', emailError);
        }
      }
    }

    console.log('Password rotation check completed');
  } catch (error) {
    console.error('Error processing password rotation:', error);
  }
}

async function recordSystemMetrics() {
  try {
    await connectDB();
    await systemService.recordMetrics();
  } catch (error) {
    console.error('Error recording system metrics:', error);
  }
}

export function startCronScheduler() {
  nodeCron.schedule('0 9 * * *', sendDailyDigestEmails, {
    timezone: 'UTC'
  });

  nodeCron.schedule('0 0 * * *', processPasswordRotation, {
    timezone: 'UTC'
  });

  recordSystemMetrics();

  nodeCron.schedule('*/5 * * * *', recordSystemMetrics, {
    timezone: 'UTC'
  });

  console.log('Cron scheduler started - daily digest at 9:00 AM UTC, password rotation at midnight UTC, metrics every 5 minutes');
}

export default startCronScheduler;