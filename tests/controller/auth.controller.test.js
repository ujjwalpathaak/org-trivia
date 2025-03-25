import authController from '../../controllers/auth.controller.js';
import authService from '../../services/auth.service.js';

jest.mock('../../services/auth.service.js');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      req.body = { email: 'test@example.com', password: 'password123' }; // Missing name & org
      await authController.register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required fields',
      });
    });

    it('should return 400 if org is empty', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        org: {},
      };
      await authController.register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No such organisation exists',
      });
    });

    it('should call authService.registerUser and return response', async () => {
      req.body = {
        isAdmin: false,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        org: { id: 'org123' },
      };
      const mockResponse = {
        status: 201,
        data: { message: 'User registered' },
      };
      authService.registerUser.mockResolvedValue(mockResponse);

      await authController.register(req, res, next);
      expect(authService.registerUser).toHaveBeenCalledWith(
        false,
        'test@example.com',
        'password123',
        'Test User',
        { id: 'org123' },
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered' });
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      req.body = { email: 'test@example.com' }; // Missing password
      await authController.login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required fields',
      });
    });

    it('should call authService.loginUser and return response', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { status: 200, data: { token: 'jwt-token' } };
      authService.loginUser.mockResolvedValue(mockResponse);

      await authController.login(req, res, next);
      expect(authService.loginUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'jwt-token' });
    });
  });
});
