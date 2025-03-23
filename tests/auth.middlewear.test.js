import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { checkRole, protectRoute } from '../middleware/auth.middleware.js'; // Adjust the path

dotenv.config();

jest.mock('jsonwebtoken');

describe('Middleware Tests', () => {
  let mockRequest, mockResponse, nextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
      data: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('checkRole', () => {
    it('should call next() if user has an allowed role', () => {
      mockRequest.data.role = 'admin';

      const middleware = checkRole('admin', 'editor');
      middleware(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have the required role', () => {
      mockRequest.data.role = 'user';

      const middleware = checkRole('admin', 'editor');
      middleware(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Access Denied: Insufficient permissions',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('protectRoute', () => {
    it('should call next() with valid token', async () => {
      const tokenPayload = { orgId: '123', employeeId: '456', role: 'admin' };
      const fakeToken = 'valid.token.here';

      mockRequest.header.mockReturnValue(`Bearer ${fakeToken}`);
      jwt.verify.mockReturnValue(tokenPayload);

      await protectRoute(mockRequest, mockResponse, nextFunction);

      expect(mockRequest.data).toEqual(tokenPayload);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      mockRequest.header.mockReturnValue(null);

      await protectRoute(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Access Denied. No token provided!',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.header.mockReturnValue('Bearer invalid.token.here');
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protectRoute(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid or Expired Token',
        }),
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if decoded token is missing required fields', async () => {
      const fakeToken = 'valid.token.here';
      mockRequest.header.mockReturnValue(`Bearer ${fakeToken}`);
      jwt.verify.mockReturnValue({}); // Missing orgId and employeeId

      await protectRoute(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid Token Data',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
