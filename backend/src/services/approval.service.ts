import mongoose from 'mongoose';
import { approvalRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import { schoolRepository } from '@/repositories';
import { notificationRepository } from '@/repositories';
import { sendEmail, generateSchoolApprovedNotificationEmail, generateSchoolRejectedNotificationEmail, generateNewSchoolRegistrationAdminEmail } from '@/lib/email';
import User from '@/models/User';

export interface CreateSchoolRequestData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
}

export interface ApprovalResult {
  success: boolean;
  message: string;
  schoolId?: string;
  approvalId?: string;
  schoolAdminId?: string;
}

export class ApprovalService {
  async requestSchool(data: CreateSchoolRequestData): Promise<ApprovalResult> {
    const existingSchool = await schoolRepository.findByEmail(data.email);
    if (existingSchool) {
      return { success: false, message: 'School with this email already exists' };
    }

    const adminUser = await userRepository.findById(data.adminId);
    if (!adminUser) {
      return { success: false, message: 'Admin user not found' };
    }

    if (adminUser.role !== 'pending_school_admin' && adminUser.role !== 'school_admin') {
      return { success: false, message: 'User must be a school admin to create a school' };
    }

    const school = await schoolRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
      adminId: new mongoose.Types.ObjectId(data.adminId),
      status: 'pending',
      isActive: false,
    });

    const approval = await approvalRepository.create({
      schoolId: school._id as mongoose.Types.ObjectId,
      requestedBy: new mongoose.Types.ObjectId(data.adminId),
      schoolName: data.name,
      schoolEmail: data.email.toLowerCase(),
    });

    await schoolRepository.updateById(school._id.toString(), {
      approvalId: approval._id
    });

    await userRepository.updateById(data.adminId, {
      schoolId: school._id,
    });

    const systemAdmins = await userRepository.findByRole('system_admin');
    for (const admin of systemAdmins) {
      await notificationRepository.create({
        userId: admin._id,
        title: 'New School Registration',
        message: `${data.name} has submitted a registration request. Please review and approve or reject.`,
        type: 'school_request',
        link: '/approvals',
      });

      try {
        const adminEmail = generateNewSchoolRegistrationAdminEmail({
          recipientEmail: admin.email,
          recipientName: admin.name,
          schoolName: data.name,
          adminEmail: data.adminEmail,
          adminName: data.adminName,
          registrationDate: new Date(),
        });
        await sendEmail(adminEmail);
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
      }
    }

    return {
      success: true,
      message: 'School registration request submitted. Awaiting approval from system administrator.',
      schoolId: school._id.toString(),
      approvalId: approval._id.toString(),
      schoolAdminId: data.adminId,
    };
  }

  async getPendingApprovals(): Promise<any[]> {
    return approvalRepository.findPending();
  }

  async getApprovalById(id: string): Promise<any> {
    return approvalRepository.findById(id);
  }

  async getApprovalBySchoolId(schoolId: string): Promise<any> {
    return approvalRepository.findBySchoolId(schoolId);
  }

  async getMyRequest(adminId: string): Promise<any[]> {
    return approvalRepository.findByRequester(adminId);
  }

  async approveSchool(approvalId: string, systemAdminId: string): Promise<ApprovalResult> {
    const approval = await approvalRepository.findById(approvalId);
    if (!approval) {
      return { success: false, message: 'Approval request not found' };
    }

    if (approval.status !== 'pending') {
      return { success: false, message: 'This approval request has already been processed' };
    }

    await approvalRepository.updateById(approvalId, {
      status: 'approved',
      approvedBy: systemAdminId,
      approvedAt: new Date(),
    });

    if (approval.schoolId) {
      try {
        await schoolRepository.updateById(approval.schoolId.toString(), {
          status: 'approved',
          isActive: true,
        });
      } catch (e) {
        console.error('Failed to update school:', e);
      }
    }

    if (approval.requestedBy) {
      console.log('[approveSchool] Updating user, requestedBy:', approval.requestedBy);
      try {
        const requestedById = approval.requestedBy.toString();
        console.log('[approveSchool] User ID to update:', requestedById);
        
    // Validate current role before approving
    const userToApprove = await User.findById(requestedById);
    const allowedRoles = ['pending_school_admin', 'school_admin'];
    if (!userToApprove || !allowedRoles.includes(userToApprove.role)) {
      throw new Error(`User with role ${userToApprove?.role} cannot be approved for school admin access`);
    }

    const user = await User.findByIdAndUpdate(
      requestedById,
      {
        role: 'school_admin',
        isApproved: true,
        isActive: true,
        schoolId: approval.schoolId,
      },
      { new: true }
    );
        
        console.log('[approveSchool] Updated user:', user);

        if (user) {
          await notificationRepository.create({
            userId: user._id,
            title: 'School Approved',
            message: `Your school "${approval.schoolName}" has been approved. You can now access all features.`,
            type: 'school_approved',
          });

          try {
            console.log('[approveSchool] Sending email to:', user.email);
            const email = generateSchoolApprovedNotificationEmail({
              recipientEmail: user.email,
              recipientName: user.name,
              schoolName: approval.schoolName,
            });
            await sendEmail(email);
            console.log('[approveSchool] Email sent successfully');
          } catch (emailError) {
            console.error('[approveSchool] Failed to send approval email:', emailError);
          }
        }
      } catch (error) {
        console.error('[approveSchool] Failed to update user on approval:', error);
      }
    }

    return {
      success: true,
      message: 'School approved successfully',
      schoolId: approval.schoolId?.toString(),
      schoolAdminId: approval.requestedBy?.toString(),
    };
  }

  async rejectSchool(approvalId: string, reason: string, systemAdminId: string): Promise<ApprovalResult> {
    const approval = await approvalRepository.findById(approvalId);
    if (!approval) {
      return { success: false, message: 'Approval request not found' };
    }

    if (approval.status !== 'pending') {
      return { success: false, message: 'This approval request has already been processed' };
    }

    await approvalRepository.updateById(approvalId, {
      status: 'rejected',
      approvedBy: systemAdminId,
      approvedAt: new Date(),
      rejectionReason: reason,
    });

    if (approval.schoolId) {
      await schoolRepository.updateById(approval.schoolId.toString(), {
        status: 'rejected',
        rejectionReason: reason,
      });
    }

    if (approval.requestedBy) {
      const adminUser = await userRepository.findById(approval.requestedBy.toString());
      if (adminUser && String(adminUser.role) !== 'system_admin') {
        await notificationRepository.create({
          userId: adminUser._id,
          title: 'School Registration Rejected',
          message: `Your school "${approval.schoolName}" registration has been rejected. Reason: ${reason}`,
          type: 'school_rejected',
        });

        const email = generateSchoolRejectedNotificationEmail({
          recipientEmail: adminUser.email,
          recipientName: adminUser.name,
          schoolName: approval.schoolName,
          reason,
        });
        await sendEmail(email);
      }
    }

    return {
      success: true,
      message: 'School registration rejected',
      schoolId: approval.schoolId?.toString(),
      schoolAdminId: approval.requestedBy?.toString(),
    };
  }

  async getPendingCount(): Promise<number> {
    return approvalRepository.countPending();
  }
}

export const approvalService = new ApprovalService();
