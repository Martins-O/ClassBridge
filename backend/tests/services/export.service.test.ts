import { generateTranscriptPDF, generateTranscriptCSV, generateGradesPDF, generateGradesCSV } from '../../src/services/export.service';

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    on: jest.fn(),
  }));
});

jest.mock('json2csv', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn().mockReturnValue('mock-csv-data'),
  })),
}));

describe('ExportService', () => {
  const mockTranscriptData = {
    studentInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      studentNumber: 'STU001',
      enrollmentDate: new Date('2024-01-15'),
    },
    courseRecords: [
      {
        className: 'Math 101',
        academicYear: '2024',
        duration: '1 semester',
        cohort: 'Spring 2024',
        grade: 'A',
        credits: 3,
        mentorName: 'Dr. Smith',
        completedDate: new Date('2024-05-15'),
      },
    ],
    academicSummary: {
      totalCredits: 15,
      gpa: 3.5,
      overallGrade: 'A',
    },
  };

  const mockGradesData = [
    {
      studentName: 'John Doe',
      studentNumber: 'STU001',
      className: 'Math 101',
      grade: 'A',
      credits: 3,
    },
  ];

  describe('generateTranscriptPDF', () => {
    it('should generate a PDF buffer', async () => {
      const result = await generateTranscriptPDF(mockTranscriptData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty course records', async () => {
      const emptyData = {
        ...mockTranscriptData,
        courseRecords: [],
        academicSummary: {
          totalCredits: 0,
          gpa: 0,
          overallGrade: 'N/A',
        },
      };

      const result = await generateTranscriptPDF(emptyData);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateTranscriptCSV', () => {
    it('should generate CSV string', async () => {
      const result = await generateTranscriptCSV(mockTranscriptData);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty course records', async () => {
      const emptyData = {
        ...mockTranscriptData,
        courseRecords: [],
      };

      const result = await generateTranscriptCSV(emptyData);

      expect(typeof result).toBe('string');
    });
  });

  describe('generateGradesPDF', () => {
    it('should generate a PDF buffer for grades', async () => {
      const result = await generateGradesPDF(mockGradesData);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty grades data', async () => {
      const result = await generateGradesPDF([]);

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateGradesCSV', () => {
    it('should generate CSV string for grades', async () => {
      const result = await generateGradesCSV(mockGradesData);

      expect(typeof result).toBe('string');
    });

    it('should handle empty grades data', async () => {
      const result = await generateGradesCSV([]);

      expect(typeof result).toBe('string');
    });
  });
});