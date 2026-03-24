import { Response } from 'express';
import {
  sendSuccess,
  sendPaginated,
  sendError,
  sendCreated,
  sendNoContent,
  sendMessage,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendValidationError,
  ApiError,
} from '../../src/lib/apiResponse';

describe('ApiResponse', () => {
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: jest.fn() });
    sendMock = jest.fn();
    mockRes = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  describe('sendSuccess', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };
      sendSuccess(mockRes as Response, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should include message when provided', () => {
      sendSuccess(mockRes as Response, {}, 'Operation successful');

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {},
        message: 'Operation successful',
      });
    });

    it('should use custom status code', () => {
      sendSuccess(mockRes as Response, {}, undefined, 201);

      expect(statusMock).toHaveBeenCalledWith(201);
    });
  });

  describe('sendPaginated', () => {
    it('should send paginated response', () => {
      const data = [{ id: 1 }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false,
      };

      sendPaginated(mockRes as Response, data, pagination);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
        meta: { pagination },
      });
    });

    it('should use custom status code', () => {
      sendPaginated(mockRes as Response, [], { 
        page: 1, 
        limit: 10, 
        total: 0, 
        totalPages: 0, 
        hasNext: false, 
        hasPrev: false 
      }, 206);

      expect(statusMock).toHaveBeenCalledWith(206);
    });
  });

  describe('sendError', () => {
    it('should send error response', () => {
      sendError(mockRes as Response, 'Something went wrong');

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Something went wrong',
        code: undefined,
      });
    });

    it('should include code when provided', () => {
      sendError(mockRes as Response, 'Error', 500, 'SERVER_ERROR');

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Error',
        code: 'SERVER_ERROR',
      });
    });
  });

  describe('sendCreated', () => {
    it('should send created response', () => {
      const data = { id: 1 };
      sendCreated(mockRes as Response, data);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should include message when provided', () => {
      sendCreated(mockRes as Response, {}, 'Resource created');

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {},
        message: 'Resource created',
      });
    });
  });

  describe('sendNoContent', () => {
    it('should send 204 response', () => {
      const mockSend = jest.fn();
      (mockRes.status as jest.Mock).mockReturnValue({ send: mockSend });
      
      sendNoContent(mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should send message with default 200', () => {
      sendMessage(mockRes as Response, 'Success');

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
      });
    });

    it('should use custom status code', () => {
      sendMessage(mockRes as Response, 'Created', 201);

      expect(statusMock).toHaveBeenCalledWith(201);
    });
  });

  describe('sendUnauthorized', () => {
    it('should send 401 with default message', () => {
      sendUnauthorized(mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    });

    it('should use custom message', () => {
      sendUnauthorized(mockRes as Response, 'Please login');

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Please login',
        })
      );
    });
  });

  describe('sendForbidden', () => {
    it('should send 403 with default message', () => {
      sendForbidden(mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
    });
  });

  describe('sendNotFound', () => {
    it('should send 404 with default message', () => {
      sendNotFound(mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND',
      });
    });
  });

  describe('sendConflict', () => {
    it('should send 409 with message', () => {
      sendConflict(mockRes as Response, 'Resource already exists');

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Resource already exists',
        code: 'CONFLICT',
      });
    });

    it('should use custom code', () => {
      sendConflict(mockRes as Response, 'Error', 'DUPLICATE');

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'DUPLICATE' })
      );
    });
  });

  describe('sendValidationError', () => {
    it('should send 400 with validation errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'name', message: 'Required' },
      ];

      sendValidationError(mockRes as Response, errors);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        meta: { errors },
      });
    });

    it('should use custom message', () => {
      sendValidationError(mockRes as Response, [], 'Invalid input');

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid input' })
      );
    });
  });

  describe('ApiError', () => {
    it('should create error with default status code', () => {
      const error = new ApiError('Error message');
      expect(error.message).toBe('Error message');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApiError');
    });

    it('should create error with custom status code', () => {
      const error = new ApiError('Not found', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should create error with code', () => {
      const error = new ApiError('Error', 500, 'ERROR_CODE');
      expect(error.code).toBe('ERROR_CODE');
    });
  });
});