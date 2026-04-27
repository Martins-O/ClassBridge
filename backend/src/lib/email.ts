import nodemailer from 'nodemailer';

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@classbridge.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'ClassBridge';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const client = EMAIL_HOST && EMAIL_USER && EMAIL_PASS
  ? nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : null;

export interface EmailData {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface StudentInvitationData {
  studentEmail: string;
  studentName: string;
  schoolName: string;
  className: string;
  invitationToken: string;
  inviterName: string;
}

export interface MentorInvitationData {
  mentorEmail: string;
  mentorName: string;
  schoolName: string;
  invitationToken: string;
  inviterName: string;
}

export interface PasswordResetEmailData {
  recipientEmail: string;
  recipientName?: string;
  resetToken: string;
}

export async function sendEmail(emailData: EmailData): Promise<void> {
  if (!client) {
    console.log(`[Email] Not configured. Would send to ${emailData.to}: ${emailData.subject}`);
    return;
  }

  try {
    await client.sendMail({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
      to: emailData.toName ? `${emailData.toName} <${emailData.to}>` : emailData.to,
      subject: emailData.subject,
      html: emailData.htmlContent,
      text: emailData.textContent || emailData.htmlContent.replace(/<[^>]*>/g, ''),
    });
    console.log(`[Email] Sent to ${emailData.to}: ${emailData.subject}`);
  } catch (error) {
    console.error(`[Email] Failed to send email to ${emailData.to}:`, error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateStudentInvitationEmail(data: StudentInvitationData): EmailData {
  const invitationUrl = `${BASE_URL}/student-invitation/${data.invitationToken}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Invitation</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px 8px 0 0; padding: 30px 20px; margin-bottom: 30px; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
    .content { margin-bottom: 30px; }
    .content h2 { color: #1f2937; margin-bottom: 15px; }
    .invitation-details { background-color: #f8fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 20px 0; }
    .invitation-details p { margin: 8px 0; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0; }
    .cta-button:hover { background-color: #2563eb; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; }
    .note { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ClassBridge Invitation</h1>
    </div>
    <div class="content">
      <h2>Hello ${data.studentName}!</h2>
      <p>You have been invited to join a class on ClassBridge! We're excited to have you as part of our educational community.</p>
      <div class="invitation-details">
        <p><strong>School:</strong> ${data.schoolName}</p>
        <p><strong>Class:</strong> ${data.className}</p>
        <p><strong>Invited by:</strong> ${data.inviterName}</p>
      </div>
      <p>To accept this invitation and create your student account, please click the button below:</p>
      <div style="text-align: center;">
        <a href="${invitationUrl}" class="cta-button">Accept Invitation & Join Class</a>
      </div>
      <div class="note">
        <p><strong>Note:</strong> This invitation link is unique to you and will expire in 7 days.</p>
      </div>
      <p>If the button doesn't work, copy this link:</p>
      <p style="word-break: break-all; color: #3b82f6;">${invitationUrl}</p>
    </div>
    <div class="footer">
      <p>This invitation was sent to ${data.studentEmail}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.studentEmail,
    toName: data.studentName,
    subject: `Invitation to join ${data.className} at ${data.schoolName}`,
    htmlContent,
  };
}

export function generatePasswordResetEmail(data: PasswordResetEmailData): EmailData {
  const resetUrl = `${BASE_URL}/reset-password/${data.resetToken}`;
  const name = data.recipientName || 'there';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 20px 40px rgba(37, 99, 235, 0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; padding: 28px 32px; }
    .content { padding: 32px; color: #0f172a; }
    .button { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; margin: 24px 0; }
    .button:hover { background: #1d4ed8; }
    .footer { padding: 20px 32px 32px; font-size: 13px; color: #64748b; }
    .note { margin-top: 24px; padding: 16px; background: #f1f5f9; border-radius: 10px; border: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 22px;">Reset your ClassBridge password</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>We received a request to reset the password for your ClassBridge account. Use the button below to choose a new password. This link is valid for the next hour.</p>
      <p style="text-align: center;">
        <a class="button" href="${resetUrl}">Create a new password</a>
      </p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: 'Reset your ClassBridge password',
    htmlContent,
  };
}

export function generateMentorInvitationEmail(data: MentorInvitationData): EmailData {
  const invitationUrl = `${BASE_URL}/mentor-invitation/${data.invitationToken}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mentor Invitation</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header { text-align: center; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 8px 8px 0 0; padding: 30px 20px; margin-bottom: 30px; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
    .content { margin-bottom: 30px; }
    .content h2 { color: #1f2937; margin-bottom: 15px; }
    .invitation-details { background-color: #faf5ff; padding: 20px; border-radius: 6px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
    .invitation-details p { margin: 8px 0; font-weight: 600; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 15px 35px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0; }
    .cta-button:hover { background: linear-gradient(135deg, #7c3aed, #db2777); }
    .footer { text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; }
    .note { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mentor Invitation</h1>
    </div>
    <div class="content">
      <h2>Hello ${data.mentorName}!</h2>
      <p>You have been invited to become a mentor at <strong>${data.schoolName}</strong> on ClassBridge!</p>
      <div class="invitation-details">
        <p><strong>School:</strong> ${data.schoolName}</p>
        <p><strong>Role:</strong> Mentor</p>
        <p><strong>Invited by:</strong> ${data.inviterName}</p>
      </div>
      <p>To accept this invitation, click the button below:</p>
      <div style="text-align: center;">
        <a href="${invitationUrl}" class="cta-button">Accept Invitation & Join as Mentor</a>
      </div>
      <div class="note">
        <p><strong>Note:</strong> This invitation link is unique to you and will expire in 7 days.</p>
      </div>
    </div>
    <div class="footer">
      <p>This invitation was sent to ${data.mentorEmail}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.mentorEmail,
    toName: data.mentorName,
    subject: `Invitation to become a mentor at ${data.schoolName}`,
    htmlContent,
  };
}

export interface GradeNotificationData {
  recipientEmail: string;
  recipientName: string;
  studentName: string;
  className: string;
  courseName: string;
  grade: string;
  percentage: number;
}

export function generateGradeNotificationEmail(data: GradeNotificationData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .grade-badge { font-size: 48px; font-weight: bold; margin: 20px 0; }
    .details { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Grade Posted</h1>
    </div>
    <p>Hello ${data.recipientName},</p>
    <p>A new grade has been posted for <strong>${data.studentName}</strong>.</p>
    <div class="grade-badge">${data.grade}</div>
    <div class="details">
      <p><strong>Course:</strong> ${data.courseName}</p>
      <p><strong>Class:</strong> ${data.className}</p>
      <p><strong>Score:</strong> ${data.percentage}%</p>
    </div>
    <p>Log in to view more details.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `New Grade: ${data.grade} in ${data.courseName}`,
    htmlContent,
  };
}

export interface AssessmentNotificationData {
  recipientEmail: string;
  recipientName: string;
  assessmentTitle: string;
  dueDate: string;
  className: string;
}

export function generateAssessmentNotificationEmail(data: AssessmentNotificationData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .due-date { font-size: 24px; font-weight: bold; margin: 20px 0; color: #dc2626; }
    .details { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Assessment Due Soon</h1>
    </div>
    <p>Hello ${data.recipientName},</p>
    <p>You have an upcoming assessment:</p>
    <div class="details">
      <p><strong>Assessment:</strong> ${data.assessmentTitle}</p>
      <p><strong>Class:</strong> ${data.className}</p>
      <div class="due-date">Due: ${data.dueDate}</div>
    </div>
    <p>Log in to start the assessment.</p>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `Assessment Due: ${data.assessmentTitle}`,
    htmlContent,
  };
}

export interface WelcomeEmailData {
  recipientEmail: string;
  recipientName: string;
  role: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .features { margin: 20px 0; }
    .features li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ClassBridge!</h1>
    </div>
    <p>Hello ${data.recipientName},</p>
    <p>Welcome to ClassBridge! Your account has been created as a <strong>${data.role}</strong>.</p>
    <div class="features">
      <h3>Getting Started:</h3>
      <ul>
        <li>Complete your profile</li>
        <li>Explore your dashboard</li>
        <li>Connect with students/mentors</li>
      </ul>
    </div>
    <p>Log in to get started!</p>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: 'Welcome to ClassBridge!',
    htmlContent,
  };
}

export interface SchoolRegistrationSubmittedData {
  recipientEmail: string;
  recipientName: string;
  schoolName: string;
}

export function generateSchoolRegistrationSubmittedEmail(data: SchoolRegistrationSubmittedData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #eff6ff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .content { padding: 20px 0; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Registration Submitted</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${data.recipientName}</strong>,</p>
      <p>Your school registration for <strong>${data.schoolName}</strong> has been submitted and is now pending approval.</p>
      <div class="info-box">
        <p style="margin: 0;"><strong>What happens next?</strong></p>
        <ul style="margin: 10px 0 0; padding-left: 20px;">
          <li>Our team will review your registration</li>
          <li>You'll receive an email once approved</li>
          <li>Approval typically takes 1-2 business days</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `School Registration Received - ${data.schoolName}`,
    htmlContent,
  };
}

export interface NewSchoolRegistrationAdminData {
  recipientEmail: string;
  recipientName: string;
  schoolName: string;
  adminEmail: string;
  adminName: string;
  registrationDate: Date;
}

export function generateNewSchoolRegistrationAdminEmail(data: NewSchoolRegistrationAdminData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #fef3c7; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .content { padding: 20px 0; }
    .info-box { background: #fef9c3; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info-item { margin: 10px 0; }
    .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New School Registration</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${data.recipientName}</strong>,</p>
      <p>A new school has registered on ClassBridge and requires your approval.</p>
      <div class="info-box">
        <div class="info-item"><strong>School Name:</strong> ${data.schoolName}</div>
        <div class="info-item"><strong>Admin Name:</strong> ${data.adminName}</div>
        <div class="info-item"><strong>Admin Email:</strong> ${data.adminEmail}</div>
        <div class="info-item"><strong>Date:</strong> ${new Date(data.registrationDate).toLocaleDateString()}</div>
      </div>
      <p>Please review the registration and approve or reject it.</p>
      <div style="text-align: center;">
        <a href="${BASE_URL}/approvals" class="cta-button">Review Registrations</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `New School Registration - ${data.schoolName}`,
    htmlContent,
  };
}

export interface SchoolApprovedNotificationData {
  recipientEmail: string;
  recipientName: string;
  schoolName: string;
}

export function generateSchoolApprovedNotificationEmail(data: SchoolApprovedNotificationData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f0fdf4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .content { padding: 20px 0; }
    .cta-button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>School Approved!</h1>
    </div>
    <div class="content">
      <p>Hello ${data.recipientName},</p>
      <p>Great news! Your school <strong>${data.schoolName}</strong> has been approved on ClassBridge.</p>
      <p>You can now access all features and start managing your educational institution.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${BASE_URL}/dashboard" class="cta-button">Go to Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `Your school "${data.schoolName}" has been approved!`,
    htmlContent,
  };
}

export interface SchoolRejectedNotificationData {
  recipientEmail: string;
  recipientName: string;
  schoolName: string;
  reason: string;
}

export function generateSchoolRejectedNotificationEmail(data: SchoolRejectedNotificationData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #fef2f2; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .reason-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>School Registration Update</h1>
    </div>
    <p>Hello ${data.recipientName},</p>
    <p>Unfortunately, your school registration for <strong>${data.schoolName}</strong> was not approved at this time.</p>
    <div class="reason-box">
      <p><strong>Reason:</strong> ${data.reason}</p>
    </div>
    <p>Please review the reason above and submit a new request with the necessary corrections.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `School registration update for "${data.schoolName}"`,
    htmlContent,
  };
}

export interface DailyDigestData {
  recipientEmail: string;
  recipientName: string;
  schoolName: string;
  notifications: Array<{
    title: string;
    message: string;
    type: string;
    createdAt: Date;
  }>;
  unreadCount: number;
}

export function generateDailyDigestEmail(data: DailyDigestData): EmailData {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const notificationsHtml = data.notifications.length > 0
    ? data.notifications.map(n => `
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p style="margin: 0; font-weight: 600; color: #1f2937;">${n.title}</p>
          <p style="margin: 5px 0 0; color: #6b7280;">${n.message}</p>
        </div>
      `).join('')
    : '<p style="color: #6b7280;">No new notifications today.</p>';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .date { color: #c7d2fe; font-size: 14px; margin-top: 10px; }
    .notifications { margin: 30px 0; }
    .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .summary-count { font-size: 32px; font-weight: bold; color: #6366f1; }
    .cta-button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Daily Digest</h1>
      <p class="date">${date}</p>
    </div>
    <p>Hello ${data.recipientName},</p>
    <p>Here's your daily summary for <strong>${data.schoolName}</strong>:</p>
    <div class="summary">
      <p style="margin: 0; color: #6b7280;">You have</p>
      <p class="summary-count">${data.unreadCount}</p>
      <p style="margin: 0; color: #6b7280;">unread notification${data.unreadCount !== 1 ? 's' : ''}</p>
    </div>
    <div class="notifications">
      <h3 style="color: #1f2937;">Recent Notifications:</h3>
      ${notificationsHtml}
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/dashboard" class="cta-button">View All Notifications</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `Daily Digest - ${data.unreadCount} new notification${data.unreadCount !== 1 ? 's' : ''} for ${data.schoolName}`,
    htmlContent,
  };
}

export interface PasswordExpiryData {
  recipientEmail: string;
  recipientName?: string;
}

export function generatePasswordExpiryEmail(data: PasswordExpiryData): EmailData {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #fef2f2; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .content { padding: 20px 0; }
    .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Expired</h1>
    </div>
    <div class="content">
      <p>Hello ${data.recipientName || 'there'},</p>
      <p>Your ClassBridge password has expired. You must change it before you can access your account again.</p>
      <div class="warning-box">
        <p><strong>Important:</strong> You will not be able to log in until you change your password.</p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/reset-password" class="cta-button">Change Password Now</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: 'Your ClassBridge password has expired',
    htmlContent,
  };
}

export interface PasswordExpiryWarningData {
  recipientEmail: string;
  recipientName?: string;
  daysRemaining: number;
  isUrgent: boolean;
}

export function generatePasswordExpiryWarningEmail(data: PasswordExpiryWarningData): EmailData {
  const headerGradient = data.isUrgent ? 'linear-gradient(135deg, #f59e0b, #dc2626)' : 'linear-gradient(135deg, #3b82f6, #2563eb)';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
    .header { background: ${headerGradient}; color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .content { padding: 20px 0; }
    .warning-box { background: ${data.isUrgent ? '#fef3c7' : '#f1f5f9'}; border: 1px solid ${data.isUrgent ? '#f59e0b' : '#e2e8f0'}; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .days-remaining { font-size: 48px; font-weight: bold; color: ${data.isUrgent ? '#dc2626' : '#3b82f6'}; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: ${data.isUrgent ? '#f59e0b' : '#3b82f6'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.isUrgent ? 'Password Expiring Soon!' : 'Password Reminder'}</h1>
    </div>
    <div class="content">
      <p>Hello ${data.recipientName || 'there'},</p>
      <p>${data.isUrgent ? 'Your ClassBridge password will expire very soon!' : 'This is a friendly reminder about your ClassBridge password.'}</p>
      <div class="days-remaining">${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}</div>
      <div class="warning-box">
        <p><strong>${data.isUrgent ? 'Urgent:' : 'Note:'}</strong> Your password will expire in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}.</p>
        <p>Please change your password soon to avoid being locked out of your account.</p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/settings" class="cta-button">Change Password Now</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClassBridge</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: data.isUrgent
      ? `Your password expires in ${data.daysRemaining} days!`
      : `Your ClassBridge password expires in ${data.daysRemaining} days`,
    htmlContent,
  };
}