import AuthService from '../services/auth.service.js';
import AuthRepository from '../repositories/auth.repository.js';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

class AuthController {
  async register(req, res, next) {
    try {
      const { isAdmin, email, password, name, org } = req.body;

      const response = await authService.registerUser(
        isAdmin,
        email,
        password,
        name,
        org,
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const response = await authService.loginUser(email, password);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
