import Assessment from '@/models/Assessment';
import AssessmentAttempt from '@/models/AssessmentAttempt';

export class AssessmentRepository {
  async findById(id: string): Promise<any> {
    return Assessment.findById(id)
      .populate('classId', 'name')
      .populate('mentorId', 'name email')
      .lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return Assessment.find(query)
      .populate('classId', 'name')
      .populate('mentorId', 'name email')
      .lean();
  }

  async findByMentor(mentorId: string): Promise<any[]> {
    return Assessment.find({ mentorId })
      .populate('classId', 'name')
      .lean();
  }

  async findByClass(classId: string): Promise<any[]> {
    return Assessment.find({ classId })
      .populate('mentorId', 'name email')
      .lean();
  }

  async create(data: any): Promise<any> {
    const assessment = new Assessment(data);
    return assessment.save();
  }

  async updateById(id: string, data: any): Promise<any> {
    return Assessment.findByIdAndUpdate(id, data, { new: true })
      .populate('classId', 'name')
      .populate('mentorId', 'name email')
      .lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Assessment.findByIdAndDelete(id);
    return !!result;
  }

  async count(query: any = {}): Promise<number> {
    return Assessment.countDocuments(query);
  }
}

export class AssessmentAttemptRepository {
  async findById(id: string): Promise<any> {
    return AssessmentAttempt.findById(id)
      .populate('assessmentId')
      .populate('studentId', 'name email')
      .lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return AssessmentAttempt.find(query)
      .populate('assessmentId')
      .populate('studentId', 'name email')
      .lean();
  }

  async findByAssessment(assessmentId: string): Promise<any[]> {
    return AssessmentAttempt.find({ assessmentId })
      .populate('studentId', 'name email')
      .lean();
  }

  async findByStudent(studentId: string): Promise<any[]> {
    return AssessmentAttempt.find({ studentId })
      .populate('assessmentId')
      .lean();
  }

  async create(data: any): Promise<any> {
    const attempt = new AssessmentAttempt(data);
    return attempt.save();
  }

  async updateById(id: string, data: any): Promise<any> {
    return AssessmentAttempt.findByIdAndUpdate(id, data, { new: true })
      .populate('assessmentId')
      .populate('studentId', 'name email')
      .lean();
  }
}

export const assessmentRepository = new AssessmentRepository();
export const assessmentAttemptRepository = new AssessmentAttemptRepository();
