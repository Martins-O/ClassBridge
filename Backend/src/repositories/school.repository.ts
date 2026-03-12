import { FilterQuery, UpdateQuery } from 'mongoose';
import School from '@/models/School';

export class SchoolRepository {
  async findById(id: string): Promise<any> {
    return School.findById(id).populate('adminId', 'name email').lean();
  }

  async findByIdBasic(id: string): Promise<any> {
    return School.findById(id).lean();
  }

  async findByEmail(email: string): Promise<any> {
    return School.findOne({ email: email.toLowerCase() }).lean();
  }

  async findAll(query: FilterQuery<any> = {}): Promise<any[]> {
    return School.find(query).populate('adminId', 'name email').lean();
  }

  async findAllPaginated(skip: number, limit: number, query: FilterQuery<any> = {}): Promise<any[]> {
    return School.find(query).populate('adminId', 'name email').skip(skip).limit(limit).lean();
  }

  async countAll(query: FilterQuery<any> = {}): Promise<number> {
    return School.countDocuments(query);
  }

  async findByAdmin(adminId: string): Promise<any[]> {
    return School.find({ adminId }).populate('adminId', 'name email').lean();
  }

  async findByAdminPaginated(adminId: string, skip: number, limit: number, query: FilterQuery<any> = {}): Promise<any[]> {
    return School.find({ ...query, adminId }).populate('adminId', 'name email').skip(skip).limit(limit).lean();
  }

  async countByAdmin(adminId: string, query: FilterQuery<any> = {}): Promise<number> {
    return School.countDocuments({ ...query, adminId });
  }

  async create(data: any): Promise<any> {
    const school = new School(data);
    return school.save();
  }

  async updateById(id: string, data: UpdateQuery<any>): Promise<any> {
    return School.findByIdAndUpdate(id, data, { new: true }).populate('adminId', 'name email').lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await School.findByIdAndDelete(id);
    return !!result;
  }

  async count(query: FilterQuery<any> = {}): Promise<number> {
    return School.countDocuments(query);
  }
}

export const schoolRepository = new SchoolRepository();
