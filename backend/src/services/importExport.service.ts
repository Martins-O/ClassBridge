import { Readable } from 'stream';

export interface StudentImportRow {
  name: string;
  email: string;
  phone?: string;
  studentId?: string;
  classIds?: string[];
}

export interface ClassImportRow {
  name: string;
  academicYear: string;
  duration: string;
  cohort: string;
  description?: string;
  subject?: string;
  grade?: string;
  mentorEmails?: string[];
  studentEmails?: string[];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(buffer: Buffer): Record<string, string>[] {
  const text = buffer.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

export function parseStudentsCSV(buffer: Buffer): Promise<StudentImportRow[]> {
  const rows = parseCSV(buffer);
  return Promise.resolve(rows
    .filter(row => row.name && row.email)
    .map(row => ({
      name: row.name.trim(),
      email: row.email.trim().toLowerCase(),
      phone: row.phone?.trim() || undefined,
      studentId: row['student id']?.trim() || row.studentid?.trim() || undefined,
      classIds: row['class ids'] ? row['class ids'].split(',').map((id: string) => id.trim()).filter(Boolean) : undefined,
    }))
  );
}

export function parseClassesCSV(buffer: Buffer): Promise<ClassImportRow[]> {
  const rows = parseCSV(buffer);
  return Promise.resolve(rows
    .filter(row => row.name && row['academic year'] && row.duration && row.cohort)
    .map(row => ({
      name: row.name.trim(),
      academicYear: row['academic year'].trim(),
      duration: row.duration.trim(),
      cohort: row.cohort.trim(),
      description: row.description?.trim() || undefined,
      subject: row.subject?.trim() || undefined,
      grade: row.grade?.trim() || undefined,
      mentorEmails: row['mentor emails'] ? row['mentor emails'].split(',').map((e: string) => e.trim()).filter(Boolean) : undefined,
      studentEmails: row['student emails'] ? row['student emails'].split(',').map((e: string) => e.trim()).filter(Boolean) : undefined,
    }))
  );
}

export function generateStudentsCSV(students: any[]): string {
  const header = 'Name,Email,Phone,Student ID,Role,Status,Created At';
  const rows = students.map(s => [
    `"${(s.name || '').replace(/"/g, '""')}"`,
    s.email || '',
    s.phone || '',
    s.studentId || '',
    s.role || 'student',
    s.isActive ? 'Active' : 'Inactive',
    s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '',
  ].join(','));
  return [header, ...rows].join('\n');
}

export function generateClassesCSV(classes: any[]): string {
  const header = 'Name,Academic Year,Duration,Cohort,Subject,Grade,Description,Student Count,Mentor Count,Status';
  const rows = classes.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    c.academicYear || '',
    c.duration || '',
    c.cohort || '',
    c.subject || '',
    c.grade || '',
    `"${(c.description || '').replace(/"/g, '""')}"`,
    (c.studentIds || []).length,
    (c.mentorIds || []).length,
    c.isActive ? 'Active' : 'Inactive',
  ].join(','));
  return [header, ...rows].join('\n');
}

export function generateGradesCSV(grades: any[]): string {
  const header = 'Student Name,Student Email,Course,Class,Grade,Score,Max Score,Percentage,Letter Grade,Mentor,Date';
  const rows = grades.map(g => [
    `"${(g.studentName || '').replace(/"/g, '""')}"`,
    g.studentEmail || '',
    `"${(g.courseName || '').replace(/"/g, '""')}"`,
    `"${(g.className || '').replace(/"/g, '""')}"`,
    g.grade || '',
    g.score || '',
    g.maxScore || '',
    g.percentage || '',
    g.letterGrade || '',
    `"${(g.mentorName || '').replace(/"/g, '""')}"`,
    g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : '',
  ].join(','));
  return [header, ...rows].join('\n');
}

