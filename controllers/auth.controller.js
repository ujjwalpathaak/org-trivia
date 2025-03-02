import AuthService from '../services/auth.service.js';
import AuthRepository from '../repositories/auth.repository.js';

const authService = new AuthService(new AuthRepository());

class AuthController {
  async register(req, res, next) {
    try {
      const { isAdmin, email, password, name, org } = req.body;
      if (!isAdmin || !email || !password || !name || !org) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      if (!org || Object.keys(org).length === 0) {
        return res.status(400).json({ message: 'No such organisation exists' });
      }

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
      if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const response = await authService.loginUser(email, password);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
