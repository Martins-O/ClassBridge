import express, { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClassBridge API',
      version: '1.0.0',
      description: 'API documentation for ClassBridge - Educational Management Platform',
      contact: {
        name: 'API Support',
        email: 'support@classbridge.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'userId',
          description: 'Session cookie authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['school_admin', 'mentor', 'student', 'super_admin'] },
            schoolId: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        School: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            website: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            subject: { type: 'string' },
            grade: { type: 'string' },
            academicYear: { type: 'string' },
            semester: { type: 'string' },
            cohort: { type: 'string' },
            duration: { type: 'string' },
            schoolId: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            classId: { type: 'string' },
            mentorId: { type: 'string' },
            subject: { type: 'string' },
            duration: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
        Assessment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            classId: { type: 'string' },
            mentorId: { type: 'string' },
            academicYear: { type: 'string' },
            assessmentType: { type: 'string', enum: ['peer', 'mentor_to_student', 'student_to_mentor', 'self'] },
            questions: { type: 'array' },
            isActive: { type: 'boolean' },
          },
        },
        Grade: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            studentId: { type: 'string' },
            courseId: { type: 'string' },
            classId: { type: 'string' },
            mentorId: { type: 'string' },
            academicYear: { type: 'string' },
            semester: { type: 'string' },
            grade: { type: 'string' },
            score: { type: 'number' },
            comments: { type: 'string' },
          },
        },
        Transcript: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            studentId: { type: 'string' },
            schoolId: { type: 'string' },
            academicYear: { type: 'string' },
            semester: { type: 'string' },
            courses: { type: 'array' },
            overallGPA: { type: 'number' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['info', 'success', 'warning', 'error'] },
            isRead: { type: 'boolean' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{
      cookieAuth: [],
    }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em; }
      .swagger-ui .info .description { font-size: 1.2em; }
    `,
    customSiteTitle: 'ClassBridge API Documentation',
  }));

  app.get('/api-docs.json', (_req, res) => {
    res.json(specs);
  });
}
