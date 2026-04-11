import mongoose from 'mongoose';
import { approvalRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import { schoolRepository } from '@/repositories';
import { notificationRepository } from '@/repositories';

export interface CreateSchoolRequestData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
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

    const existingUser = await userRepository.findByEmail(data.adminEmail);
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    const user = await userRepository.create({
      email: data.adminEmail.toLowerCase(),
      password: data.adminPassword,
      name: data.adminName,
      role: 'school_admin',
      isActive: true,
      isApproved: false,
    });

    const school = await schoolRepository.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      website: data.website,
      description: data.description,
      adminId: user._id,
      status: 'pending',
    });

    const approval = await approvalRepository.create({
      schoolId: school._id as mongoose.Types.ObjectId,
      requestedBy: user._id as mongoose.Types.ObjectId,
      schoolName: data.name,
      schoolEmail: data.email.toLowerCase(),
    });

    await schoolRepository.updateById(school._id.toString(), {
      approvalId: approval._id
    });

    return {
      success: true,
      message: 'School registration request submitted. Awaiting approval from system administrator.',
      schoolId: school._id.toString(),
      approvalId: approval._id.toString(),
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

    await schoolRepository.updateById(approval.schoolId.toString(), {
      status: 'approved',
    });

    await userRepository.updateById(approval.requestedBy.toString(), {
      isApproved: true,
    });

    const adminUser = await userRepository.findById(approval.requestedBy.toString());
    if (adminUser) {
      await notificationRepository.create({
        userId: adminUser._id,
        title: 'School Approved',
        message: `Your school "${approval.schoolName}" has been approved. You can now access all features.`,
        type: 'school_approved',
      });
    }

    return {
      success: true,
      message: 'School approved successfully',
      schoolId: approval.schoolId.toString(),
      schoolAdminId: adminUser?._id?.toString(),
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

    await schoolRepository.updateById(approval.schoolId.toString(), {
      status: 'rejected',
      rejectionReason: reason,
    });

    const adminUser = await userRepository.findById(approval.requestedBy.toString());
    if (adminUser) {
      await notificationRepository.create({
        userId: adminUser._id,
        title: 'School Registration Rejected',
        message: `Your school "${approval.schoolName}" registration has been rejected. Reason: ${reason}`,
        type: 'school_rejected',
      });
    }

    return {
      success: true,
      message: 'School registration rejected',
      schoolId: approval.schoolId.toString(),
      schoolAdminId: adminUser?._id?.toString(),
    };
  }

  async getPendingCount(): Promise<number> {
    return approvalRepository.countPending();
  }
}

export const approvalService = new ApprovalService();
