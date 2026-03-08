import { assessmentRepository, assessmentAttemptRepository } from '@/repositories';

export class AssessmentService {
  async getAll(userId: string, userRole: string): Promise<any[]> {
    if (userRole === 'super_admin' || userRole === 'school_admin') {
      return assessmentRepository.findAll();
    } else if (userRole === 'mentor') {
      return assessmentRepository.findByMentor(userId);
    }
    return [];
  }

  async getById(id: string): Promise<any> {
    return assessmentRepository.findById(id);
  }

  async create(data: {
    title: string;
    classId: string;
    mentorId: string;
    academicYear: string;
    assessmentType: string;
    questions: any[];
    description?: string;
    semester?: string;
  }): Promise<any> {
    return assessmentRepository.create(data);
  }

  async update(id: string, data: any): Promise<any> {
    return assessmentRepository.updateById(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return assessmentRepository.deleteById(id);
  }

  async getAttempts(assessmentId: string): Promise<any[]> {
    return assessmentAttemptRepository.findByAssessment(assessmentId);
  }

  async createAttempt(data: {
    assessmentId: string;
    studentId: string;
  }): Promise<any> {
    return assessmentAttemptRepository.create({
      ...data,
      responses: [],
      isSubmitted: false,
      startedAt: new Date(),
    });
  }

  async updateAttempt(id: string, data: any): Promise<any> {
    return assessmentAttemptRepository.updateById(id, data);
  }

  async getAttempt(id: string): Promise<any> {
    return assessmentAttemptRepository.findById(id);
  }
}

export const assessmentService = new AssessmentService();
