import { loginUser, registerUser } from '../services/auth.service.js';

/**
 * Registers a new user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {boolean} [req.body.isAdmin] - Whether the user is an admin
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @param {string} req.body.name - User's name
 * @param {Object} req.body.org - Organization object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
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

/**
 * Logs in a user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
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
