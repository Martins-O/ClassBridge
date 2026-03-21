import mongoose from 'mongoose';
import SchoolApproval from '@/models/SchoolApproval';

export class ApprovalRepository {
  async findById(id: string): Promise<any> {
    return SchoolApproval.findById(id).populate('requestedBy', 'name email role').lean();
  }

  async findBySchoolId(schoolId: string): Promise<any> {
    return SchoolApproval.findOne({ schoolId }).lean();
  }

  async findByRequester(requesterId: string): Promise<any[]> {
    return SchoolApproval.find({ requestedBy: requesterId }).lean();
  }

  async findPending(): Promise<any[]> {
    return SchoolApproval.find({ status: 'pending' })
      .populate('requestedBy', 'name email role')
      .sort({ requestedAt: -1 })
      .lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return SchoolApproval.find(query)
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ requestedAt: -1 })
      .lean();
  }

  async create(data: {
    schoolId: mongoose.Types.ObjectId;
    requestedBy: mongoose.Types.ObjectId;
    schoolName: string;
    schoolEmail: string;
  }): Promise<any> {
    const approval = new SchoolApproval(data);
    return approval.save();
  }

  async updateById(id: string, data: any): Promise<any> {
    return SchoolApproval.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await SchoolApproval.findByIdAndDelete(id);
    return !!result;
  }

  async countPending(): Promise<number> {
    return SchoolApproval.countDocuments({ status: 'pending' });
  }
}

export const approvalRepository = new ApprovalRepository();
