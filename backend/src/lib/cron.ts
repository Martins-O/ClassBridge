import nodeCron from 'node-cron';
import connectDB from './mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';
import School from '@/models/School';
import { sendEmail, generateDailyDigestEmail, DailyDigestData } from '@/lib/email';

async function sendDailyDigestEmails() {
  try {
    await connectDB();

    const users = await User.find({ role: { $in: ['school_admin', 'mentor'] } })
      .populate('school', 'name')
      .lean();

    for (const user of users) {
      if (!user.school) continue;

      const school = user.school as unknown as { name: string };
      const unreadNotifications = await Notification.find({
        userId: user._id,
        isRead: false,
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }).lean();

      const unreadCount = await Notification.countDocuments({
        userId: user._id,
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

export function startCronScheduler() {
  nodeCron.schedule('0 9 * * *', sendDailyDigestEmails, {
    timezone: 'UTC'
  });

  console.log('Cron scheduler started - daily digest at 9:00 AM UTC');
}

export default startCronScheduler;