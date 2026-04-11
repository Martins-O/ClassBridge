import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API instance
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key from environment variable
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

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

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: process.env.EMAIL_FROM_NAME || 'ClassBridge',
      email: process.env.EMAIL_FROM_ADDRESS || 'noreply@classbridge.com'
    };

    sendSmtpEmail.to = [{
      email: emailData.to,
      name: emailData.toName || ''
    }];

    sendSmtpEmail.subject = emailData.subject;
    sendSmtpEmail.htmlContent = emailData.htmlContent;

    if (emailData.textContent) {
      sendSmtpEmail.textContent = emailData.textContent;
    }

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch {
    return false;
  }
}

export function generateStudentInvitationEmail(data: StudentInvitationData): EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const invitationUrl = `${baseUrl}/student-invitation/${data.invitationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Student Invitation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px 8px 0 0;
          padding: 30px 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .logo {
          display: inline-block;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 8px;
          margin-bottom: 15px;
          position: relative;
        }
        .content {
          margin-bottom: 30px;
        }
        .content h2 {
          color: #1f2937;
          margin-bottom: 15px;
        }
        .invitation-details {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
        }
        .invitation-details p {
          margin: 8px 0;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .cta-button:hover {
          background-color: #2563eb;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          margin-top: 30px;
        }
        .note {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <svg viewBox="0 0 40 40" style="width: 100%; height: 100%; padding: 8px;">
              <defs>
                <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="50%" stop-color="#8b5cf6" />
                  <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
              </defs>
              <path d="M4 22 Q12 15, 20 17 Q28 19, 36 22 L36 25 Q28 22, 20 20 Q12 18, 4 25 Z" fill="url(#bridgeGradient)" />
              <rect x="3" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
              <rect x="35" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
              <rect x="19" y="17" width="2" height="13" fill="url(#bridgeGradient)" rx="1" />
            </svg>
          </div>
          <h1>🎓 ClassBridge Invitation</h1>
        </div>

        <div class="content">
          <h2>Hello ${data.studentName}!</h2>

          <p>You have been invited to join a class on ClassBridge! We're excited to have you as part of our educational community where mentors and students connect seamlessly.</p>

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
            <p><strong>Note:</strong> This invitation link is unique to you and will expire in 7 days. If you have any questions, please contact your school administrator.</p>
          </div>

          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6;">${invitationUrl}</p>
        </div>

        <div class="footer">
          <p>This invitation was sent to ${data.studentEmail}</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hello ${data.studentName}!

You have been invited to join a class on our educational platform.

Invitation Details:
- School: ${data.schoolName}
- Class: ${data.className}
- Invited by: ${data.inviterName}

To accept this invitation and create your student account, please visit:
${invitationUrl}

This invitation link is unique to you and will expire in 7 days.

If you have any questions, please contact your school administrator.

This invitation was sent to ${data.studentEmail}
If you didn't expect this invitation, you can safely ignore this email.
  `;

  return {
    to: data.studentEmail,
    toName: data.studentName,
    subject: `Invitation to join ${data.className} at ${data.schoolName}`,
    htmlContent,
    textContent
  };
}

export function generatePasswordResetEmail(data: PasswordResetEmailData): EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password/${data.resetToken}`;
  const name = data.recipientName ?? 'there';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your ClassBridge password</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
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
          <p>If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged.</p>
          <p class="note">
            Need help? Contact your school administrator or reply to this email to reach the ClassBridge support team.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ClassBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hi ${name},\n\nUse the link below to reset your ClassBridge password. This link is valid for one hour.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`;

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: 'Reset your ClassBridge password',
    htmlContent,
    textContent,
  };
}

export function generateMentorInvitationEmail(data: MentorInvitationData): EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const invitationUrl = `${baseUrl}/mentor-invitation/${data.invitationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mentor Invitation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 8px 8px 0 0;
          padding: 30px 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .logo {
          display: inline-block;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 8px;
          margin-bottom: 15px;
          position: relative;
        }
        .content {
          margin-bottom: 30px;
        }
        .content h2 {
          color: #1f2937;
          margin-bottom: 15px;
        }
        .invitation-details {
          background-color: #faf5ff;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #8b5cf6;
          margin: 20px 0;
        }
        .invitation-details p {
          margin: 8px 0;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          padding: 15px 35px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .cta-button:hover {
          background: linear-gradient(135deg, #7c3aed, #db2777);
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          margin-top: 30px;
        }
        .note {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .features {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .features ul {
          margin: 0;
          padding-left: 20px;
        }
        .features li {
          margin: 8px 0;
          color: #374151;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <svg viewBox="0 0 40 40" style="width: 100%; height: 100%; padding: 8px;">
              <defs>
                <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#8b5cf6" />
                  <stop offset="50%" stop-color="#a855f7" />
                  <stop offset="100%" stop-color="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M4 22 Q12 15, 20 17 Q28 19, 36 22 L36 25 Q28 22, 20 20 Q12 18, 4 25 Z" fill="url(#bridgeGradient)" />
              <rect x="3" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
              <rect x="35" y="22" width="2" height="8" fill="url(#bridgeGradient)" rx="1" />
              <rect x="19" y="17" width="2" height="13" fill="url(#bridgeGradient)" rx="1" />
            </svg>
          </div>
          <h1>🎓 Mentor Invitation</h1>
        </div>

        <div class="content">
          <h2>Hello ${data.mentorName}!</h2>

          <p>You have been invited to become a mentor at <strong>${data.schoolName}</strong> on ClassBridge! We believe your expertise would be invaluable in guiding and inspiring students on their educational journey.</p>

          <div class="invitation-details">
            <p><strong>School:</strong> ${data.schoolName}</p>
            <p><strong>Role:</strong> Mentor</p>
            <p><strong>Invited by:</strong> ${data.inviterName}</p>
          </div>

          <div class="features">
            <h3>As a mentor, you'll be able to:</h3>
            <ul>
              <li>Guide and support students in their learning journey</li>
              <li>Manage classes and track student progress</li>
              <li>Create and share educational resources</li>
              <li>Collaborate with other mentors and administrators</li>
              <li>Make a meaningful impact on students' educational success</li>
            </ul>
          </div>

          <p>To accept this invitation and create your mentor account, please click the button below:</p>

          <div style="text-align: center;">
            <a href="${invitationUrl}" class="cta-button">Accept Invitation & Join as Mentor</a>
          </div>

          <div class="note">
            <p><strong>Note:</strong> This invitation link is unique to you and will expire in 7 days. If you have any questions about the role or ClassBridge platform, please contact ${data.inviterName} or your school administrator.</p>
          </div>

          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #8b5cf6;">${invitationUrl}</p>
        </div>

        <div class="footer">
          <p>This invitation was sent to ${data.mentorEmail}</p>
          <p>If you didn't expect this invitation or don't want to become a mentor, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hello ${data.mentorName}!

You have been invited to become a mentor at ${data.schoolName} on ClassBridge!

Invitation Details:
- School: ${data.schoolName}
- Role: Mentor
- Invited by: ${data.inviterName}

As a mentor, you'll be able to:
- Guide and support students in their learning journey
- Manage classes and track student progress
- Create and share educational resources
- Collaborate with other mentors and administrators
- Make a meaningful impact on students' educational success

To accept this invitation and create your mentor account, please visit:
${invitationUrl}

This invitation link is unique to you and will expire in 7 days.

If you have any questions about the role or ClassBridge platform, please contact ${data.inviterName} or your school administrator.

This invitation was sent to ${data.mentorEmail}
If you didn't expect this invitation or don't want to become a mentor, you can safely ignore this email.
  `;

  return {
    to: data.mentorEmail,
    toName: data.mentorName,
    subject: `Invitation to become a mentor at ${data.schoolName}`,
    htmlContent,
    textContent
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
          <h1>📊 New Grade Posted</h1>
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
          <p>© ${new Date().getFullYear()} ClassBridge</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `New Grade: ${data.grade} in ${data.courseName}`,
    htmlContent
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
          <h1>📝 Assessment Due Soon</h1>
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
  `;

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `Assessment Due: ${data.assessmentTitle}`,
    htmlContent
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
          <h1>🎓 Welcome to ClassBridge!</h1>
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
  `;

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: 'Welcome to ClassBridge!',
    htmlContent
  };
}

export interface SchoolApprovedNotificationData {
  recipientEmail: string;
  recipientName: string;
  schoolName: string;
}

export function generateSchoolApprovedNotificationEmail(data: SchoolApprovedNotificationData): EmailData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

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
          <h1>🎉 School Approved!</h1>
        </div>
        <div class="content">
          <p>Hello ${data.recipientName},</p>
          <p>Great news! Your school <strong>${data.schoolName}</strong> has been approved on ClassBridge.</p>
          <p>You can now access all features and start managing your educational institution.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard" class="cta-button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClassBridge</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `Your school "${data.schoolName}" has been approved!`,
    htmlContent
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
          <p>© ${new Date().getFullYear()} ClassBridge</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `School registration update for "${data.schoolName}"`,
    htmlContent
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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
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
          <h1>📬 Daily Digest</h1>
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
          <a href="${baseUrl}/dashboard" class="cta-button">View All Notifications</a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          You're receiving this because you enabled daily digest emails.<br>
          <a href="${baseUrl}/settings" style="color: #6366f1;">Manage email preferences</a>
        </p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ClassBridge</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return {
    to: data.recipientEmail,
    toName: data.recipientName,
    subject: `Daily Digest - ${data.unreadCount} new notification${data.unreadCount !== 1 ? 's' : ''} for ${data.schoolName}`,
    htmlContent
  };
}
