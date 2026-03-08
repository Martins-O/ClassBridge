import Grade from '@/models/Grade';

export class GradeRepository {
  async findById(id: string): Promise<any> {
    return Grade.findById(id)
      .populate('studentId', 'name email studentId')
      .populate('mentorId', 'name email')
      .populate('courseId', 'name')
      .populate('classId', 'name')
      .lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return Grade.find(query)
      .populate('studentId', 'name email studentId')
      .populate('mentorId', 'name email')
      .populate('courseId', 'name')
      .populate('classId', 'name')
      .lean();
  }

  async findByStudent(studentId: string): Promise<any[]> {
    return Grade.find({ studentId })
      .populate('mentorId', 'name email')
      .populate('courseId', 'name')
      .populate('classId', 'name')
      .lean();
  }

  async findByCourse(courseId: string): Promise<any[]> {
    return Grade.find({ courseId })
      .populate('studentId', 'name email studentId')
      .populate('mentorId', 'name email')
      .lean();
  }

  async findByClass(classId: string): Promise<any[]> {
    return Grade.find({ classId })
      .populate('studentId', 'name email studentId')
      .populate('mentorId', 'name email')
      .populate('courseId', 'name')
      .lean();
  }

  async create(data: any): Promise<any> {
    const grade = new Grade(data);
    return grade.save();
  }

  async createMany(data: any[]): Promise<any[]> {
    return Grade.insertMany(data);
  }

  async updateById(id: string, data: any): Promise<any> {
    return Grade.findByIdAndUpdate(id, data, { new: true })
      .populate('studentId', 'name email studentId')
      .populate('mentorId', 'name email')
      .lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Grade.findByIdAndDelete(id);
    return !!result;
  }

  async deleteByStudent(studentId: string): Promise<number> {
    const result = await Grade.deleteMany({ studentId });
    return result.deletedCount;
  }

  async count(query: any = {}): Promise<number> {
    return Grade.countDocuments(query);
  }
}

export const gradeRepository = new GradeRepository();
