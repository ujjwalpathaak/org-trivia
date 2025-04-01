import {
  getUserByEmail,
  createNewUser,
  isPasswordsMatch,
  generateToken,
} from '../repositories/auth.repository.js';

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
