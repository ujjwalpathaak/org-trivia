import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js';
import { updateNewUserInOrg } from './org.repository.js';

export const getUserByEmail = async (email) => {
  const [admin, employee] = await Promise.all([
    Admin.findOne({ email }),
    Employee.findOne({ email }),
  ]);
  return admin || employee || null;
};

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

export const isPasswordsMatch = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

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
