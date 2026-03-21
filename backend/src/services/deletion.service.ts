import mongoose from 'mongoose';
import { deletionRequestRepository } from '@/repositories';
import { userRepository } from '@/repositories';
import { notificationRepository } from '@/repositories';
import { isSystemAdmin, isSchoolAdmin, canApproveDelete } from '@/lib/permissions';
import { UserRole } from '@/models/User';

export interface DeletionRequestData {
  userId: string;
  requestedBy: string;
  schoolId: string;
  reason?: string;
}

export interface DeletionResult {
  success: boolean;
  message: string;
  requestId?: string;
}

export class DeletionService {
  async requestDeletion(data: DeletionRequestData): Promise<DeletionResult> {
    const userToDelete = await userRepository.findById(data.userId);
    if (!userToDelete) {
      return { success: false, message: 'User not found' };
    }

    if (userToDelete.deletionRequested) {
      return { success: false, message: 'A deletion request already exists for this user' };
    }

    const existingRequest = await deletionRequestRepository.existsPendingForUser(data.userId);
    if (existingRequest) {
      return { success: false, message: 'A deletion request is already pending for this user' };
    }

    if (data.requestedBy === data.userId) {
      return { success: false, message: 'You cannot request your own deletion' };
    }

    const requester = await userRepository.findById(data.requestedBy);
    if (!requester) {
      return { success: false, message: 'Requester not found' };
    }

    if (requester.schoolId?.toString() !== userToDelete.schoolId?.toString()) {
      return { success: false, message: 'You can only request deletion of users in your school' };
    }

    if (isSystemAdmin(userToDelete.role as UserRole)) {
      return { success: false, message: 'Cannot request deletion of system administrators' };
    }

    const request = await deletionRequestRepository.create({
      userId: new mongoose.Types.ObjectId(data.userId),
      requestedBy: new mongoose.Types.ObjectId(data.requestedBy),
      schoolId: new mongoose.Types.ObjectId(data.schoolId),
      userEmail: userToDelete.email,
      userName: userToDelete.name,
      reason: data.reason,
    });

    await userRepository.updateById(data.userId, {
      deletionRequested: true,
      deletionRequestedBy: data.requestedBy,
      deletionRequestedAt: new Date(),
    });

    return {
      success: true,
      message: 'Deletion request submitted successfully',
      requestId: request._id.toString(),
    };
  }

  async getPendingRequests(schoolId: string): Promise<any[]> {
    return deletionRequestRepository.findPending(schoolId);
  }

  async getRequestById(id: string): Promise<any> {
    return deletionRequestRepository.findById(id);
  }

  async getRequestsForSchool(schoolId: string): Promise<any[]> {
    return deletionRequestRepository.findBySchool(schoolId);
  }

  async approveDeletion(requestId: string, approverId: string): Promise<DeletionResult> {
    const request = await deletionRequestRepository.findById(requestId);
    if (!request) {
      return { success: false, message: 'Deletion request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, message: 'This deletion request has already been processed' };
    }

    const approver = await userRepository.findById(approverId);
    if (!approver) {
      return { success: false, message: 'Approver not found' };
    }

    if (!canApproveDelete(approver.role as UserRole)) {
      return { success: false, message: 'You do not have permission to approve deletion requests' };
    }

    if (approver.schoolId?.toString() !== request.schoolId.toString()) {
      return { success: false, message: 'You can only approve deletions for your school' };
    }

    await deletionRequestRepository.updateById(requestId, {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
    });

    await userRepository.deleteById(request.userId.toString());

    await notificationRepository.create({
      userId: approver._id,
      title: 'Deletion Approved',
      message: `User "${request.userName}" has been deleted.`,
      type: 'deletion_approved',
    });

    return {
      success: true,
      message: 'User deletion approved and completed',
    };
  }

  async rejectDeletion(requestId: string, reason: string, rejecterId: string): Promise<DeletionResult> {
    const request = await deletionRequestRepository.findById(requestId);
    if (!request) {
      return { success: false, message: 'Deletion request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, message: 'This deletion request has already been processed' };
    }

    const rejecter = await userRepository.findById(rejecterId);
    if (!rejecter) {
      return { success: false, message: 'Rejecter not found' };
    }

    if (!canApproveDelete(rejecter.role as UserRole)) {
      return { success: false, message: 'You do not have permission to reject deletion requests' };
    }

    if (rejecter.schoolId?.toString() !== request.schoolId.toString()) {
      return { success: false, message: 'You can only reject deletions for your school' };
    }

    await deletionRequestRepository.updateById(requestId, {
      status: 'rejected',
      approvedBy: rejecterId,
      approvedAt: new Date(),
      rejectionReason: reason,
    });

    await userRepository.updateById(request.userId.toString(), {
      deletionRequested: false,
      deletionRequestedBy: undefined,
      deletionRequestedAt: undefined,
    });

    await notificationRepository.create({
      userId: request.requestedBy,
      title: 'Deletion Request Rejected',
      message: `Your deletion request for "${request.userName}" has been rejected. Reason: ${reason}`,
      type: 'deletion_rejected',
    });

    return {
      success: true,
      message: 'Deletion request rejected',
    };
  }

  async getPendingCount(schoolId?: string): Promise<number> {
    return deletionRequestRepository.countPending(schoolId);
  }

  async cancelRequest(requestId: string, requesterId: string): Promise<DeletionResult> {
    const request = await deletionRequestRepository.findById(requestId);
    if (!request) {
      return { success: false, message: 'Deletion request not found' };
    }

    if (request.requestedBy.toString() !== requesterId) {
      return { success: false, message: 'Only the requester can cancel this request' };
    }

    if (request.status !== 'pending') {
      return { success: false, message: 'This request has already been processed' };
    }

    await deletionRequestRepository.deleteById(requestId);

    await userRepository.updateById(request.userId.toString(), {
      deletionRequested: false,
      deletionRequestedBy: undefined,
      deletionRequestedAt: undefined,
    });

    return {
      success: true,
      message: 'Deletion request cancelled',
    };
  }
}

export const deletionService = new DeletionService();
