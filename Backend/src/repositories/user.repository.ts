import { FilterQuery, UpdateQuery, Document } from 'mongoose';
import User from '@/models/User';

export class UserRepository {
  async findById(id: string): Promise<any> {
    return User.findById(id).select('-password').lean();
  }

  async findByIdWithPassword(id: string): Promise<any> {
    return User.findById(id).lean();
  }

  async findByEmail(email: string): Promise<any> {
    return User.findOne({ email: email.toLowerCase() }).lean();
  }

  async findAll(query: FilterQuery<any> = {}): Promise<any[]> {
    return User.find(query).select('-password').lean();
  }

  async findBySchool(schoolId: string): Promise<any[]> {
    return User.find({ schoolId }).select('-password').lean();
  }

  async findByRole(role: string): Promise<any[]> {
    return User.find({ role }).select('-password').lean();
  }

  async findMentorsBySchool(schoolId: string): Promise<any[]> {
    return User.find({ role: 'mentor', schoolId }).select('-password').lean();
  }

  async findStudentsBySchool(schoolId: string): Promise<any[]> {
    return User.find({ role: 'student', schoolId }).select('-password').lean();
  }

  async findStudentsByClass(classId: string): Promise<any[]> {
    return User.find({ role: 'student', classIds: classId }).select('-password').lean();
  }

  async create(data: any): Promise<any> {
    const user = new User(data);
    return user.save();
  }

  async updateById(id: string, data: UpdateQuery<any>): Promise<any> {
    return User.findByIdAndUpdate(id, data, { new: true }).select('-password').lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async addClassToUser(userId: string, classId: string): Promise<any> {
    return User.findByIdAndUpdate(
      userId,
      { $addToSet: { classIds: classId } },
      { new: true }
    ).select('-password').lean();
  }

  async removeClassFromUser(userId: string, classId: string): Promise<any> {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { classIds: classId } },
      { new: true }
    ).select('-password').lean();
  }

  async count(query: FilterQuery<any> = {}): Promise<number> {
    return User.countDocuments(query);
  }
}

export const userRepository = new UserRepository();
