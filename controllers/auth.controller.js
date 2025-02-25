import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js';

import AuthService from '../services/auth.service.js';
import AuthRepository from '../repositories/auth.repository.js';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

export const register = async (request, response) => {
  try {
    const { isAdmin, email, password, name, org } = request.body;

    const [UserModel, userType] = isAdmin
      ? [Admin, 'Admin']
      : [Employee, 'Employee'];

    const user = await authService.getUserByEmail(email);

    if (user) {
      return response.status(400).json({ message: `This email already exists` });
    }

    if (!org || Object.keys(org).length === 0) {
      return response.status(400).json({ message: `No such organisation exists` });
    }

    await authService.createUser(UserModel, email, password, name, org);

    response.status(201).json({
      message: `New ${userType} registered successfully`,
    });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    const user = await authService.getUserByEmail(email);

    if (!user) {
      return response.status(404).json({ message: 'User not found!' });
    }

    const isMatch = await authService.passwordsMatch(password, user.password);
    if (!isMatch) {
      return response.status(401).json({ message: 'Invalid password' });
    }

    const token = authService.generateToken(user);

    response.status(200).json({
      message: `user logged in successfully`,
      token,
    });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Server Error', error: error.message });
  }
};
