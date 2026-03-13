import PDFDocument from 'pdfkit';
// @ts-ignore - json2csv doesn't have types
import { Parser } from 'json2csv';
import { Response } from 'express';

export interface TranscriptData {
    studentInfo: {
        name: string;
        email: string;
        studentNumber: string;
        enrollmentDate: Date;
    };
    courseRecords: {
        className: string;
        academicYear: string;
        duration: string;
        cohort: string;
        grade: string;
        credits: number;
        mentorName: string;
        completedDate: Date;
    }[];
    academicSummary: {
        totalCredits: number;
        gpa: number;
        overallGrade: string;
    };
}

export async function generateTranscriptPDF(data: TranscriptData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).text('Official Transcript', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(14).text('Student Information', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Name: ${data.studentInfo.name}`);
        doc.text(`Email: ${data.studentInfo.email}`);
        doc.text(`Student Number: ${data.studentInfo.studentNumber}`);
        doc.text(`Enrollment Date: ${new Date(data.studentInfo.enrollmentDate).toLocaleDateString()}`);
        
        doc.moveDown();
        doc.fontSize(14).text('Course Records', { underline: true });
        doc.moveDown(0.5);
        
        data.courseRecords.forEach((record, index) => {
            doc.fontSize(11);
            doc.text(`${index + 1}. ${record.className}`);
            doc.text(`   Year: ${record.academicYear}, Duration: ${record.duration}, Cohort: ${record.cohort}`);
            doc.text(`   Grade: ${record.grade}, Credits: ${record.credits}, Mentor: ${record.mentorName}`);
            doc.text(`   Completed: ${new Date(record.completedDate).toLocaleDateString()}`);
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(14).text('Academic Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Total Credits: ${data.academicSummary.totalCredits}`);
        doc.text(`GPA: ${data.academicSummary.gpa.toFixed(2)}`);
        doc.text(`Overall Grade: ${data.academicSummary.overallGrade}`);
        
        doc.moveDown(2);
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

        doc.end();
    });
}

export function generateTranscriptCSV(data: TranscriptData): string {
    const fields = [
        'className',
        'academicYear',
        'duration',
        'cohort',
        'grade',
        'credits',
        'mentorName',
        'completedDate'
    ];
    
    const parser = new Parser({ fields });
    return parser.parse(data.courseRecords);
}

export interface GradeData {
    studentName: string;
    studentEmail: string;
    studentId: string;
    className: string;
    courseName: string;
    gradeType: string;
    title: string;
    points: number;
    maxPoints: number;
    percentage: number;
    letterGrade: string;
    gradedDate: Date;
}

export function generateGradesCSV(grades: GradeData[]): string {
    const fields = [
        'studentName',
        'studentEmail',
        'studentId',
        'className',
        'courseName',
        'gradeType',
        'title',
        'points',
        'maxPoints',
        'percentage',
        'letterGrade',
        'gradedDate'
    ];
    
    const parser = new Parser({ fields });
    return parser.parse(grades.map(g => ({
        ...g,
        gradedDate: new Date(g.gradedDate).toLocaleDateString()
    })));
}

export async function generateGradesPDF(grades: GradeData[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).text('Student Grades Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        const tableTop = doc.y;
        const columns = {
            student: 50,
            class: 150,
            title: 280,
            grade: 400,
            date: 470
        };

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Student', columns.student, tableTop);
        doc.text('Class', columns.class, tableTop);
        doc.text('Title', columns.title, tableTop);
        doc.text('Grade', columns.grade, tableTop);
        doc.text('Date', columns.date, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let y = tableTop + 25;
        doc.font('Helvetica').fontSize(9);

        grades.forEach((grade) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            doc.text(grade.studentName.substring(0, 20), columns.student, y);
            doc.text(grade.className.substring(0, 20), columns.class, y);
            doc.text(grade.title.substring(0, 25), columns.title, y);
            doc.text(`${grade.letterGrade} (${grade.percentage}%)`, columns.grade, y);
            doc.text(new Date(grade.gradedDate).toLocaleDateString(), columns.date, y);
            
            y += 15;
        });

        doc.end();
    });
}

export interface StudentCourseData {
    studentName: string;
    studentEmail: string;
    studentId: string;
    enrolledDate: Date;
    courseName: string;
    className: string;
    mentorName: string;
    status: string;
}

export function generateStudentCourseCSV(students: StudentCourseData[]): string {
    const fields = [
        'studentName',
        'studentEmail',
        'studentId',
        'enrolledDate',
        'courseName',
        'className',
        'mentorName',
        'status'
    ];
    
    const parser = new Parser({ fields });
    return parser.parse(students.map(s => ({
        ...s,
        enrolledDate: new Date(s.enrolledDate).toLocaleDateString()
    })));
}
