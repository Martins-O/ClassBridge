import { userRepository } from '@/repositories';
import bcrypt from 'bcryptjs';

export class UserService {
  async getById(id: string): Promise<any> {
    return userRepository.findById(id);
  }

  async getAll(): Promise<any[]> {
    return userRepository.findAll();
  }

  async getBySchool(schoolId: string): Promise<any[]> {
    return userRepository.findBySchool(schoolId);
  }

  async getMentorsBySchool(schoolId: string): Promise<any[]> {
    return userRepository.findMentorsBySchool(schoolId);
  }

  async getStudentsBySchool(schoolId: string): Promise<any[]> {
    return userRepository.findStudentsBySchool(schoolId);
  }

  async getStudentsByClass(classId: string): Promise<any[]> {
    return userRepository.findStudentsByClass(classId);
  }

  async update(id: string, data: any): Promise<any> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    return userRepository.updateById(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return userRepository.deleteById(id);
  }

  async addClassToUser(userId: string, classId: string): Promise<any> {
    return userRepository.addClassToUser(userId, classId);
  }

  async removeClassFromUser(userId: string, classId: string): Promise<any> {
    return userRepository.removeClassFromUser(userId, classId);
  }

  async count(): Promise<number> {
    return userRepository.count();
  }
}

export const userService = new UserService();
