import Transcript from '@/models/Transcript';

export class TranscriptRepository {
  async findById(id: string): Promise<any> {
    return Transcript.findById(id)
      .populate('studentId', 'name email studentId')
      .populate('schoolId', 'name')
      .lean();
  }

  async findAll(query: any = {}): Promise<any[]> {
    return Transcript.find(query)
      .populate('studentId', 'name email studentId')
      .populate('schoolId', 'name')
      .lean();
  }

  async findByStudent(studentId: string): Promise<any[]> {
    return Transcript.find({ studentId })
      .populate('schoolId', 'name')
      .lean();
  }

  async findBySchool(schoolId: string): Promise<any[]> {
    return Transcript.find({ schoolId })
      .populate('studentId', 'name email studentId')
      .lean();
  }

  async create(data: any): Promise<any> {
    const transcript = new Transcript(data);
    return transcript.save();
  }

  async updateById(id: string, data: any): Promise<any> {
    return Transcript.findByIdAndUpdate(id, data, { new: true })
      .populate('studentId', 'name email studentId')
      .lean();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Transcript.findByIdAndDelete(id);
    return !!result;
  }
}

export const transcriptRepository = new TranscriptRepository();
