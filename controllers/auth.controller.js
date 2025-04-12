import { loginUser, registerUser } from '../services/auth.service.js';

export const registerController = async (req, res, next) => {
  try {
    const { isAdmin, email, password, name, org } = req.body;

    if (!email || !password || !name || !org) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!org || Object.keys(org).length === 0) {
      return res.status(400).json({ message: 'No such organisation exists' });
    }

    const response = await registerUser(isAdmin, email, password, name, org);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const response = await loginUser(email, password);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
