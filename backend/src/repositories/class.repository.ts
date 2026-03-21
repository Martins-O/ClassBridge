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

  async findAllPaginated(skip: number, limit: number): Promise<any[]> {
    return Class.find()
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countAll(): Promise<number> {
    return Class.countDocuments();
  }

  async findBySchool(schoolId: string): Promise<any[]> {
    return Class.find({ schoolId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .lean();
  }

  async findBySchoolPaginated(schoolId: string, skip: number, limit: number): Promise<any[]> {
    return Class.find({ schoolId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countBySchool(schoolId: string): Promise<number> {
    return Class.countDocuments({ schoolId });
  }

  async findByMentor(mentorId: string): Promise<any[]> {
    return Class.find({ mentorIds: mentorId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .lean();
  }

  async findByMentorPaginated(mentorId: string, skip: number, limit: number): Promise<any[]> {
    return Class.find({ mentorIds: mentorId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByMentor(mentorId: string): Promise<number> {
    return Class.countDocuments({ mentorIds: mentorId });
  }

  async findByStudent(studentId: string): Promise<any[]> {
    return Class.find({ studentIds: studentId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .lean();
  }

  async findByStudentPaginated(studentId: string, skip: number, limit: number): Promise<any[]> {
    return Class.find({ studentIds: studentId })
      .populate('mentorIds', 'name email')
      .populate('studentIds', 'name email studentId isActive')
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByStudent(studentId: string): Promise<number> {
    return Class.countDocuments({ studentIds: studentId });
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
