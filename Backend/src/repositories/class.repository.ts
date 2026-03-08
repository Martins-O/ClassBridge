import { FilterQuery, UpdateQuery } from 'mongoose';
import Class from '@/models/Class';

export class ClassRepository {
  async findById(id: string): Promise<any> {
    return Class.findById(id).populate(['mentorIds', 'studentIds', 'schoolId']).lean();
  }

  async findByIdBasic(id: string): Promise<any> {
    return Class.findById(id).lean();
  }

  async findAll(query: FilterQuery<any> = {}): Promise<any[]> {
    return Class.find(query)
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .lean();
  }

  async findBySchool(schoolId: string): Promise<any[]> {
    return Class.find({ schoolId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .lean();
  }

  async findByMentor(mentorId: string): Promise<any[]> {
    return Class.find({ mentorIds: mentorId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .lean();
  }

  async findByStudent(studentId: string): Promise<any[]> {
    return Class.find({ studentIds: studentId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .lean();
  }

  async create(data: any): Promise<any> {
    const cls = new Class(data);
    return cls.save();
  }

  async updateById(id: string, data: UpdateQuery<any>): Promise<any> {
    return Class.findByIdAndUpdate(id, data, { new: true })
      .populate(['mentorIds', 'studentIds', 'schoolId'])
      .lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Class.findByIdAndDelete(id);
    return !!result;
  }

  async addStudent(classId: string, studentIds: string[]): Promise<any> {
    return Class.findByIdAndUpdate(
      classId,
      { $addToSet: { studentIds: { $each: studentIds } } },
      { new: true }
    ).populate(['mentorIds', 'studentIds', 'schoolId']).lean();
  }

  async removeStudent(classId: string, studentId: string): Promise<any> {
    return Class.findByIdAndUpdate(
      classId,
      { $pull: { studentIds: studentId } },
      { new: true }
    ).populate(['mentorIds', 'studentIds', 'schoolId']).lean();
  }

  async count(query: FilterQuery<any> = {}): Promise<number> {
    return Class.countDocuments(query);
  }
}

export const classRepository = new ClassRepository();
