import Course from '@/models/Course';

export class CourseRepository {
  async findById(id: string): Promise<any> {
    return Course.findById(id)
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name email')
      .populate('studentIds', 'name email')
      .lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return Course.find(query)
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name email')
      .populate('studentIds', 'name email')
      .lean();
  }

  async findByMentor(mentorId: string): Promise<any[]> {
    return Course.find({ mentorId })
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name email')
      .populate('studentIds', 'name email')
      .lean();
  }

  async findByStudent(studentId: string): Promise<any[]> {
    return Course.find({ studentIds: studentId })
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name email')
      .populate('studentIds', 'name email')
      .lean();
  }

  async findByClass(classId: string): Promise<any[]> {
    return Course.find({ classId })
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name email')
      .lean();
  }

  async create(data: any): Promise<any> {
    const course = new Course(data);
    return course.save();
  }

  async updateById(id: string, data: any): Promise<any> {
    return Course.findByIdAndUpdate(id, data, { new: true })
      .populate('classId', 'name academicYear')
      .populate('mentorId', 'name email')
      .populate('studentIds', 'name email')
      .lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Course.findByIdAndDelete(id);
    return !!result;
  }

  async count(query: any = {}): Promise<number> {
    return Course.countDocuments(query);
  }
}

export const courseRepository = new CourseRepository();
