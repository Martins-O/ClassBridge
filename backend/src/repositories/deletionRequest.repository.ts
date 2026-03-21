import mongoose from 'mongoose';
import DeletionRequest from '@/models/DeletionRequest';

export class DeletionRequestRepository {
  async findById(id: string): Promise<any> {
    return DeletionRequest.findById(id)
      .populate('userId', 'name email role')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .lean();
  }

  async findByUserId(userId: string): Promise<any[]> {
    return DeletionRequest.find({ userId }).lean();
  }

  async findBySchool(schoolId: string): Promise<any[]> {
    return DeletionRequest.find({ schoolId })
      .populate('userId', 'name email role')
      .populate('requestedBy', 'name email role')
      .sort({ requestedAt: -1 })
      .lean();
  }

  async findPending(schoolId?: string): Promise<any[]> {
    const query: any = { status: 'pending' };
    if (schoolId) {
      query.schoolId = schoolId;
    }
    return DeletionRequest.find(query)
      .populate('userId', 'name email role')
      .populate('requestedBy', 'name email role')
      .sort({ requestedAt: -1 })
      .lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return DeletionRequest.find(query)
      .populate('userId', 'name email role')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ requestedAt: -1 })
      .lean();
  }

  async create(data: {
    userId: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    schoolId: mongoose.Types.ObjectId;
    userEmail: string;
    userName: string;
    reason?: string;
  }): Promise<any> {
    const request = new DeletionRequest(data);
    return request.save();
  }

  async updateById(id: string, data: any): Promise<any> {
    return DeletionRequest.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await DeletionRequest.findByIdAndDelete(id);
    return !!result;
  }

  async countPending(schoolId?: string): Promise<number> {
    const query: any = { status: 'pending' };
    if (schoolId) {
      query.schoolId = schoolId;
    }
    return DeletionRequest.countDocuments(query);
  }

  async existsPendingForUser(userId: string): Promise<boolean> {
    const count = await DeletionRequest.countDocuments({
      userId,
      status: 'pending'
    });
    return count > 0;
  }
}

export const deletionRequestRepository = new DeletionRequestRepository();
