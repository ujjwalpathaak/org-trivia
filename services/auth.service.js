import {
  createNewUser,
  generateToken,
  getUserByEmail,
  isPasswordsMatch,
} from '../repositories/auth.repository.js';

/**
 * Registers a new user (admin or employee) in the system
 * @param {boolean} isAdmin - Whether the user is an admin
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} name - User's full name
 * @param {string} orgId - Organization ID the user belongs to
 * @returns {Promise<Object>} Response object containing status and message
 * @returns {number} Response.status - HTTP status code (201 for success, 400 for error)
 * @returns {Object} Response.data - Response data containing success/error message
 */
export const registerUser = async (isAdmin, email, password, name, orgId) => {
  const user = await getUserByEmail(email);
  if (user) {
    return { status: 400, data: { message: `This email already exists` } };
  }

  await createNewUser(email, password, name, orgId, isAdmin);

  return {
    status: 201,
    data: {
      message: `New ${isAdmin ? 'Admin' : 'Employee'} registered successfully`,
    },
  };
};

/**
 * Authenticates a user and generates a JWT token
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response object containing status, message and token
 * @returns {number} Response.status - HTTP status code (200 for success, 401/404 for error)
 * @returns {Object} Response.data - Response data containing success/error message and JWT token if successful
 */
export const loginUser = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user) {
    return { status: 404, data: { message: 'User not found!' } };
  }

  const isMatch = await isPasswordsMatch(password, user.password);
  if (!isMatch) {
    return { status: 401, data: { message: 'Invalid password' } };
  }

  const token = generateToken(user);

  return {
    status: 200,
    data: { message: 'User logged in successfully', token },
  };
};
