import { Request, Response, NextFunction } from 'express';
import {
  authenticate,
  authorize,
  requirePermission,
  requireSystemAdmin,
  requireSchoolAdmin,
  requireSchoolStaff,
  requireSchoolApproved,
  optionalAuth,
  AuthRequest,
} from '../../src/lib/authorization';
import { PERMISSIONS } from '../../src/lib/permissions';
import { TokenPayload } from '../../src/lib/jwt';

jest.mock('../../src/lib/jwt', () => ({
  verifyAccessToken: jest.fn(),
  TokenPayload: {},
}));

const { verifyAccessToken } = require('../../src/lib/jwt');

describe('Authorization Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should call next if token is valid', () => {
      (verifyAccessToken as jest.Mock).mockReturnValue({ userId: '123', role: 'student' });
      mockReq.headers = { authorization: 'Bearer valid-token' };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as AuthRequest).user).toBeDefined();
    });

    it('should return 401 if no authorization header', () => {
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      mockReq.headers = { authorization: 'Basic token' };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if token is invalid', () => {
      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize', () => {
    it('should call next if user has allowed role', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'school_admin' };
      
      const middleware = authorize('school_admin', 'system_admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user role not allowed', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'student' };
      
      const middleware = authorize('school_admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
    });

    it('should return 401 if no user', () => {
      const middleware = authorize('school_admin');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requirePermission', () => {
    it('should call next if user has permission', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'school_admin' };
      
      const middleware = requirePermission(PERMISSIONS.MANAGE_USERS);
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user lacks permission', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'student' };
      
      const middleware = requirePermission(PERMISSIONS.MANAGE_USERS);
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireSystemAdmin', () => {
    it('should call next if user is system_admin', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'system_admin' };
      
      const middleware = requireSystemAdmin();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user is not system_admin', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'school_admin' };
      
      const middleware = requireSystemAdmin();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        error: 'System admin access required' 
      }));
    });
  });

  describe('requireSchoolAdmin', () => {
    it('should call next if user is school_admin', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'school_admin' };
      
      const middleware = requireSchoolAdmin();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user is not school_admin', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'student' };
      
      const middleware = requireSchoolAdmin();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireSchoolStaff', () => {
    it('should call next if user is school staff', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'mentor' };
      
      const middleware = requireSchoolStaff();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user is not school staff', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'student' };
      
      const middleware = requireSchoolStaff();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireSchoolApproved', () => {
    it('should call next if user is system_admin', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'system_admin' };
      
      const middleware = requireSchoolApproved();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if school status is pending', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'school_admin', schoolStatus: 'pending' };
      
      const middleware = requireSchoolApproved();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        code: 'SCHOOL_PENDING_APPROVAL' 
      }));
    });

    it('should return 403 if school status is rejected', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' };
      (mockReq as AuthRequest).user = { userId: '123', name: 'Test User', email: 'test@test.com', role: 'school_admin', schoolStatus: 'rejected' };
      
      const middleware = requireSchoolApproved();
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
        code: 'SCHOOL_REJECTED' 
      }));
    });
  });

  describe('optionalAuth', () => {
    it('should call next and attach user if token is valid', () => {
      (verifyAccessToken as jest.Mock).mockReturnValue({ userId: '123', role: 'student' });
      mockReq.headers = { authorization: 'Bearer valid-token' };

      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as AuthRequest).user).toBeDefined();
    });

    it('should call next without user if token is invalid', () => {
      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid');
      });
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as AuthRequest).user).toBeUndefined();
    });

    it('should call next without user if no token', () => {
      optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as AuthRequest).user).toBeUndefined();
    });
  });
});