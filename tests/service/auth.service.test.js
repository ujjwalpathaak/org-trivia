import authService from '../../services/auth.service.js';
import authRepository from '../../repositories/auth.repository.js';

jest.mock('../../repositories/auth.repository.js');

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should return 400 if email already exists', async () => {
      authRepository.getUserByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      const response = await authService.registerUser(false, 'test@example.com', 'password', 'John Doe', 'org123');

      expect(response).toEqual({
        status: 400,
        data: { message: 'This email already exists' },
      });
      expect(authRepository.createNewUser).not.toHaveBeenCalled();
    });

    it('should register a new user successfully', async () => {
      authRepository.getUserByEmail.mockResolvedValue(null);
      authRepository.createNewUser.mockResolvedValue();

      const response = await authService.registerUser(true, 'admin@example.com', 'securepass', 'Admin User', 'org456');

      expect(response).toEqual({
        status: 201,
        data: { message: 'New Admin registered successfully' },
      });
      expect(authRepository.createNewUser).toHaveBeenCalledWith(
        'admin@example.com', 'securepass', 'Admin User', 'org456', true
      );
    });
  });

  describe('loginUser', () => {
    it('should return 404 if user is not found', async () => {
      authRepository.getUserByEmail.mockResolvedValue(null);

      const response = await authService.loginUser('missing@example.com', 'password');

      expect(response).toEqual({ status: 404, data: { message: 'User not found!' } });
    });

    it('should return 401 if password is incorrect', async () => {
      authRepository.getUserByEmail.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashedpass' });
      authRepository.isPasswordsMatch.mockResolvedValue(false);

      const response = await authService.loginUser('user@example.com', 'wrongpass');

      expect(response).toEqual({ status: 401, data: { message: 'Invalid password' } });
    });

    it('should return 200 and a token if login is successful', async () => {
      authRepository.getUserByEmail.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashedpass' });
      authRepository.isPasswordsMatch.mockResolvedValue(true);
      authRepository.generateToken.mockReturnValue('mocked-token');

      const response = await authService.loginUser('user@example.com', 'correctpass');

      expect(response).toEqual({
        status: 200,
        data: { message: 'User logged in successfully', token: 'mocked-token' },
      });
      expect(authRepository.generateToken).toHaveBeenCalledWith({ id: 1, email: 'user@example.com', password: 'hashedpass' });
    });
  });
});