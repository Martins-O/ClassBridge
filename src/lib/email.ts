import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API instance
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key from environment variable
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
} else {
  console.warn('BREVO_API_KEY environment variable is not set');
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

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', result.response?.statusCode);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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