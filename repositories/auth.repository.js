import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js';
import { updateNewUserInOrg } from './org.repository.js';

/**
 * Finds a user by their email address
 * @param {string} email - The email address to search for
 * @returns {Promise<Object|null>} The user document (admin or employee) or null if not found
 */
export const getUserByEmail = async (email) => {
  const [admin, employee] = await Promise.all([
    Admin.findOne({ email }),
    Employee.findOne({ email }),
  ]);
  return admin || employee || null;
};

/**
 * Creates a new user (admin or employee)
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @param {string} name - The user's name
 * @param {string} orgId - The ID of the organization
 * @param {boolean} isAdmin - Whether the user is an admin
 * @returns {Promise<Object>} The created user document
 */
export const createNewUser = async (email, password, name, orgId, isAdmin) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const UserModel = isAdmin ? Admin : Employee;
  const newUser = await new UserModel({
    email,
    password: hashedPassword,
    name,
    orgId,
  }).save();

  await updateNewUserInOrg(orgId, isAdmin, newUser);
  return newUser;
};

/**
 * Compares a password with a hashed password
 * @param {string} password - The plain text password
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
export const isPasswordsMatch = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generates a JWT token for a user
 * @param {Object} user - The user object
 * @returns {string} The generated JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      employeeId: user._id,
      role: user.role,
      name: user.name,
      orgId: user.orgId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
};
