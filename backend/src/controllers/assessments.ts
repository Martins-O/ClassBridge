import { Request, Response } from 'express';
import connectDB from '@/lib/mongodb';
import Assessment from '@/models/Assessment';
import User from '@/models/User';
import { getUserIdFromRequest } from '@/lib/session';
import {
  ValidationResult,
  ValidationError,
  validateString,
  validateArray,
  validateObjectId,
  validateEnum,
  validateNumber
} from '@/lib/validation';

export async function getAssessments(req: Request, res: Response) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { searchParams } = new URL(req.url || 'http://localhost');
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const assessmentType = searchParams.get('assessmentType');

    // Build query
    const query: {
      createdBy: string;
      schoolId?: string;
      classIds?: { $in: string[] };
      assessmentType?: string;
    } = { createdBy: userId };

    if (schoolId) {
      query.schoolId = schoolId;
    }

    if (classId) {
      query.classIds = { $in: [classId] };
    }

    if (assessmentType) {
      query.assessmentType = assessmentType;
    }

    const assessments = await Assessment.find(query)
      .populate('schoolId', 'name')
      .populate('classIds', 'name subject')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ assessments });
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return res.status(500).json({ error: 'Failed to fetch assessments' });
  }
}

export async function createAssessment(req: Request, res: Response) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only school admins, mentors, and super admins can create assessments
    if (!['school_admin', 'mentor', 'system_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Only school administrators and mentors can create assessments' });
    }

    const assessmentData = req.body;

    // Comprehensive validation
    const validation = new ValidationResult();

    // Validate basic fields
    validation.errors.push(...validateString(assessmentData.title, 'title', { required: true, minLength: 3, maxLength: 200 }));
    validation.errors.push(...validateString(assessmentData.description, 'description', { required: true, minLength: 10, maxLength: 1000 }));
    validation.errors.push(...validateObjectId(assessmentData.schoolId, 'schoolId'));
    validation.errors.push(...validateEnum(assessmentData.targetRole, 'targetRole', ['mentor', 'student']));
    validation.errors.push(...validateEnum(assessmentData.assessorRole, 'assessorRole', ['mentor', 'student', 'self']));
    validation.errors.push(...validateEnum(assessmentData.assessmentType, 'assessmentType', ['peer', 'mentor_to_student', 'student_to_mentor', 'self']));

    // Validate questions array
    if (Array.isArray(assessmentData.questions)) {
      if (assessmentData.questions.length < 1) {
        validation.addError('questions', 'questions must have at least 1 item');
      }
      if (assessmentData.questions.length > 50) {
        validation.addError('questions', 'questions must have at most 50 items');
      }
      assessmentData.questions.forEach((question: any, index: number) => {
        const questionErrors: ValidationError[] = [];
        const questionText = question?.question;
        const questionType = question?.type;

        questionErrors.push(
          ...validateString(questionText, `questions[${index}].question`, { required: true, minLength: 5, maxLength: 500 })
        );
        questionErrors.push(
          ...validateEnum(questionType, `questions[${index}].type`, ['multiple-choice', 'checkbox', 'text', 'rating', 'scale'])
        );

        if (questionErrors.length > 0) {
          validation.errors.push(...questionErrors);
        }
      });
    } else {
      validation.addError('questions', 'questions must be an array');
    }

    // Validate optional numeric fields
    if (assessmentData.timeLimit !== undefined) {
      validation.errors.push(...validateNumber(assessmentData.timeLimit, 'timeLimit', { min: 1, max: 480, integer: true }));
    }
    if (assessmentData.maxAttempts !== undefined) {
      validation.errors.push(...validateNumber(assessmentData.maxAttempts, 'maxAttempts', { min: 1, max: 10, integer: true }));
    }
    if (assessmentData.passingScore !== undefined) {
      validation.errors.push(...validateNumber(assessmentData.passingScore, 'passingScore', { min: 0, max: 100, integer: true }));
    }

    if (!validation.isValid()) {
      return res.status(400).json(validation.getResponse());
    }

    // Create assessment
    const assessment = new Assessment({
      ...assessmentData,
      createdBy: userId,
      isActive: true
    });

    await assessment.save();

    return res.status(201).json({
      success: true,
      assessment: {
        id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        assessmentType: assessment.assessmentType,
        targetRole: assessment.targetRole,
        assessorRole: assessment.assessorRole,
        isActive: assessment.isActive,
        createdAt: assessment.createdAt
      }
    });
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return res.status(500).json({ error: 'Failed to create assessment' });
  }
}

export async function getAssessment(req: Request, res: Response) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const assessment = await Assessment.findById(id)
      .populate('schoolId', 'name')
      .populate('classIds', 'name subject')
      .populate('createdBy', 'name email');

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    return res.json({ assessment });
  } catch (error) {
    console.error('Failed to fetch assessment:', error);
    return res.status(500).json({ error: 'Failed to fetch assessment' });
  }
}

export async function updateAssessment(req: Request, res: Response) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const assessment = await Assessment.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found or unauthorized' });
    }

    return res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return res.status(500).json({ error: 'Failed to update assessment' });
  }
}

export async function deleteAssessment(req: Request, res: Response) {
  try {
    await connectDB();

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const assessment = await Assessment.findOneAndDelete({
      _id: id,
      createdBy: userId
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found or unauthorized' });
    }

    return res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete assessment:', error);
    return res.status(500).json({ error: 'Failed to delete assessment' });
  }
}

export async function createAssessmentAttempt(req: Request, res: Response) {
  try {
    await connectDB();
    const { id } = req.params;

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { respondentId, classId } = req.body;

    // Get assessment
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if assessment is active and within date range
    if (!assessment.isActive) {
      return res.status(400).json({ error: 'Assessment is not active' });
    }

    if (assessment.startDate && new Date() < assessment.startDate) {
      return res.status(400).json({ error: 'Assessment has not started yet' });
    }

    if (assessment.endDate && new Date() > assessment.endDate) {
      return res.status(400).json({ error: 'Assessment has ended' });
    }

    // Check existing attempts
    const existingAttempts = await Assessment.countDocuments({
      assessmentId: id,
      respondentId: respondentId || userId
    });

    if (assessment.maxAttempts && existingAttempts >= assessment.maxAttempts) {
      return res.status(400).json({ error: 'Maximum attempts reached' });
    }

    // Create new attempt
    const AssessmentAttempt = (await import('@/models/AssessmentAttempt')).default;
    const attempt = new AssessmentAttempt({
      assessmentId: id,
      respondentId: respondentId || userId,
      assessorId: userId,
      schoolId: assessment.schoolId,
      classId: classId,
      answers: [],
      attemptNumber: existingAttempts + 1,
      startedAt: new Date(),
      isComplete: false
    });

    await attempt.save();

    return res.status(201).json({
      success: true,
      attempt: {
        id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt
      }
    });
  } catch (error) {
    console.error('Failed to start assessment attempt:', error);
    return res.status(500).json({ error: 'Failed to start assessment attempt' });
  }
}

export async function getAssessmentAttempts(req: Request, res: Response) {
  try {
    await connectDB();
    const { id } = req.params;

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { searchParams } = new URL(req.url || 'http://localhost');
    const respondentId = searchParams.get('respondentId');

    // Build query
    const query: { assessmentId: string; respondentId?: string; assessorId?: string } = { assessmentId: id };

    if (respondentId) {
      query.respondentId = respondentId;
    } else {
      // If no specific respondent, show attempts where user is assessor
      query.assessorId = userId;
    }

    const AssessmentAttempt = (await import('@/models/AssessmentAttempt')).default;
    const attempts = await AssessmentAttempt.find(query)
      .populate('respondentId', 'name email')
      .populate('assessorId', 'name email')
      .sort({ startedAt: -1 });

    return res.json({ attempts });
  } catch (error) {
    console.error('Failed to fetch assessment attempts:', error);
    return res.status(500).json({ error: 'Failed to fetch assessment attempts' });
  }
}

export async function getAssessmentAttempt(req: Request, res: Response) {
  try {
    await connectDB();
    const { attemptId } = req.params;

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const AssessmentAttempt = (await import('@/models/AssessmentAttempt')).default;
    const attempt = await AssessmentAttempt.findById(attemptId)
      .populate('assessmentId')
      .populate('respondentId', 'name email')
      .populate('assessorId', 'name email');

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    // Check authorization
    if (attempt.assessorId._id.toString() !== userId && attempt.respondentId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.json({ attempt });
  } catch (error) {
    console.error('Failed to fetch assessment attempt:', error);
    return res.status(500).json({ error: 'Failed to fetch assessment attempt' });
  }
}

export async function updateAssessmentAttempt(req: Request, res: Response) {
  try {
    await connectDB();
    const { attemptId } = req.params;

    // Check authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { answers, isComplete = false } = req.body;

    // Get attempt
    const AssessmentAttempt = (await import('@/models/AssessmentAttempt')).default;
    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    // Check authorization (user must be the assessor)
    if (attempt.assessorId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get assessment for scoring
    const assessment = await Assessment.findById(attempt.assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Calculate score if completing
    let score = 0;
    let maxScore = 0;
    let percentage = 0;
    let passed = false;

    if (isComplete && answers && answers.length > 0) {
      // Calculate score based on question weights and types
      for (const question of assessment.questions) {
        const weight = question.weight || 1;
        maxScore += weight;

        const answer = answers.find((a: { questionId: string; answer: string | number | string[] }) => a.questionId === question.id);
        if (answer) {
          // Score based on question type
          switch (question.type) {
            case 'rating':
            case 'scale':
              if (typeof answer.answer === 'number') {
                score += (answer.answer * weight);
              }
              break;
            case 'multiple-choice':
              // For multiple choice, give full points if answered
              if (answer.answer) {
                score += weight;
              }
              break;
            case 'checkbox':
              // For checkbox, give points based on selection
              if (Array.isArray(answer.answer) && answer.answer.length > 0) {
                score += weight;
              }
              break;
            case 'text':
              // For text, give full points if answered (manual review may be needed)
              if (answer.answer && answer.answer.trim()) {
                score += weight;
              }
              break;
          }
        }
      }

      percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      passed = assessment.passingScore ? percentage >= assessment.passingScore : true;
    }

    // Update attempt
    const updateData: {
      answers: typeof answers | typeof attempt.answers;
      timeSpent: number;
      isComplete?: boolean;
      submittedAt?: Date;
      score?: number;
      maxScore?: number;
      percentage?: number;
      passed?: boolean;
    } = {
      answers: answers || attempt.answers,
      timeSpent: Math.floor((new Date().getTime() - attempt.startedAt.getTime()) / 1000)
    };

    if (isComplete) {
      updateData.isComplete = true;
      updateData.submittedAt = new Date();
      updateData.score = score;
      updateData.maxScore = maxScore;
      updateData.percentage = percentage;
      updateData.passed = passed;
    }

    const updatedAttempt = await AssessmentAttempt.findByIdAndUpdate(
      attemptId,
      updateData,
      { new: true }
    );

    return res.json({
      success: true,
      attempt: updatedAttempt
    });
  } catch (error) {
    console.error('Failed to update assessment attempt:', error);
    return res.status(500).json({ error: 'Failed to update assessment attempt' });
  }
}
