# Email Invitation System Setup Guide

This guide will help you set up the email invitation system using Brevo (formerly Sendinblue) for student invitations.

## 🎯 Overview

The email invitation system allows school administrators and mentors to:
- Send email invitations to students to join specific classes
- Students receive beautifully formatted HTML emails with invitation details
- Students can accept invitations by creating their accounts through a secure link
- Automatic class enrollment upon invitation acceptance

## 📋 Prerequisites

1. **Brevo Account**: Sign up at [https://brevo.com](https://brevo.com)
2. **Brevo API Key**: Obtain from your Brevo dashboard
3. **Domain Setup**: Configure your sending domain (optional but recommended for production)

## 🔧 Setup Instructions

### Step 1: Get Brevo API Key

1. Log into your Brevo account
2. Go to **Settings** → **API Keys**
3. Create a new API key with **Send emails** permission
4. Copy the generated API key

### Step 2: Configure Environment Variables

Add these variables to your `.env.local` file:

```env
# Brevo Email Configuration
BREVO_API_KEY=your-brevo-api-key-here

# Email Settings
EMAIL_FROM_NAME="Your School Name"
EMAIL_FROM_ADDRESS="noreply@yourschool.com"

# Application URL (used in invitation links)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Step 3: Domain Configuration (Production)

For production use, configure your domain in Brevo:

1. Go to **Settings** → **Senders & IP**
2. Add your domain (e.g., `yourschool.com`)
3. Verify domain ownership via DNS records
4. Configure SPF, DKIM, and DMARC records

## 📧 How It Works

### 1. Sending Invitations

**Who can send invitations:**
- School Administrators (to any class in their school)
- Mentors (to classes they teach)

**Process:**
1. Navigate to School Management → Students tab
2. Click "Invite Student"
3. Fill in student details and select classes
4. System sends invitation email automatically

### 2. Student Invitation Email

Students receive a professional HTML email containing:
- School and class information
- Inviter details
- Secure invitation link
- Expiration date (7 days)
- Clear call-to-action button

### 3. Accepting Invitations

**Student process:**
1. Click invitation link in email
2. View invitation details
3. Set account password
4. Account created and enrolled in class automatically

## 🗂 File Structure

```
src/
├── lib/
│   └── email.ts                           # Email service configuration
├── models/
│   └── StudentInvitation.ts              # Invitation data model
├── app/
│   ├── api/
│   │   └── students/
│   │       ├── invite/route.ts            # Send invitation API
│   │       ├── accept-invitation/route.ts # Accept invitation API
│   │       └── invitation/[token]/route.ts# Get invitation details API
│   ├── dashboard/school/page.tsx          # Invitation form UI
│   └── student-invitation/[token]/page.tsx # Invitation acceptance page
```

## 🎨 Email Template Features

### HTML Email Design
- Responsive design for all devices
- Professional styling with school branding
- Clear information hierarchy
- Prominent call-to-action button

### Email Content
- Personalized greeting
- School and class details
- Inviter information
- Secure invitation link
- Expiration warning
- Fallback plain text version

## 🔒 Security Features

### Invitation Security
- Unique cryptographic tokens (UUID)
- 7-day expiration
- One-time use tokens
- Email verification required

### Access Control
- Role-based invitation permissions
- Class-specific mentor access
- School-admin domain restrictions

### Data Protection
- No sensitive data in email content
- Secure token-based authentication
- Automatic cleanup of expired invitations

## 🚀 API Endpoints

### Send Invitation
```http
POST /api/students/invite
Content-Type: application/json

{
  "studentEmail": "student@example.com",
  "studentName": "John Doe",
  "classId": "class_id_here"
}
```

### Accept Invitation
```http
POST /api/students/accept-invitation
Content-Type: application/json

{
  "token": "invitation_token_here",
  "password": "student_password"
}
```

### Get Invitation Details
```http
GET /api/students/invitation/{token}
```

## 🧪 Testing

### Test Email Sending

1. Ensure Brevo API key is configured
2. Create a test class and school
3. Send invitation to your own email
4. Verify email delivery and formatting
5. Test invitation acceptance flow

### Email Testing Tools

- **Brevo Test Mode**: Use Brevo's test mode for development
- **Email Clients**: Test across Gmail, Outlook, Apple Mail
- **Responsive Design**: Test on mobile and desktop
- **Spam Filters**: Check deliverability scores

## 🔧 Configuration Options

### Email Customization

Modify `src/lib/email.ts` to customize:
- Email templates
- Styling and branding
- Content and messaging
- From address and name

### Invitation Settings

Adjust in the API routes:
- Expiration time (default: 7 days)
- Token generation method
- Validation rules
- Error messages

## 📊 Monitoring

### Email Delivery
- Monitor through Brevo dashboard
- Track delivery, open, and click rates
- Set up webhooks for delivery status

### Invitation Analytics
- Track invitation send/accept rates
- Monitor expired invitations
- Analyze user conversion funnel

## 🛠 Troubleshooting

### Common Issues

**Email not sending:**
- Verify BREVO_API_KEY is set correctly
- Check API key permissions
- Ensure sender email is verified

**Invitation links not working:**
- Verify NEXT_PUBLIC_BASE_URL is correct
- Check token generation and validation
- Ensure database is connected

**Students can't accept invitations:**
- Check invitation expiration
- Verify student email matches invitation
- Ensure password validation rules

### Debug Mode

Add to your `.env.local` for debugging:
```env
DEBUG_EMAIL=true
```

## 🚦 Production Checklist

- [ ] Brevo API key configured
- [ ] Domain verification completed
- [ ] SPF/DKIM records set up
- [ ] Email templates tested
- [ ] Invitation flow tested end-to-end
- [ ] Error handling verified
- [ ] Monitoring set up
- [ ] Backup email service configured (optional)

## 📞 Support

For technical issues:
1. Check Brevo API status
2. Verify environment variables
3. Review application logs
4. Test with different email providers

For Brevo-specific issues:
- Visit [Brevo Support](https://help.brevo.com/)
- Check [API Documentation](https://developers.brevo.com/)

---

**Note**: This system is designed for educational institutions with proper consent and data protection measures in place. Ensure compliance with local privacy regulations (GDPR, COPPA, etc.) when handling student data.