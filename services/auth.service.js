import authRepository from '../repositories/auth.repository.js';

const registerUser = async (isAdmin, email, password, name, orgId) => {
  const user = await authRepository.getUserByEmail(email);
  if (user) {
    return { status: 400, data: { message: `This email already exists` } };
  }

  await authRepository.createNewUser(email, password, name, orgId, isAdmin);

  return {
    status: 201,
    data: {
      message: `New ${isAdmin ? 'Admin' : 'Employee'} registered successfully`,
    },
  };
};

const loginUser = async (email, password) => {
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    return { status: 404, data: { message: 'User not found!' } };
  }

  const isMatch = await authRepository.isPasswordsMatch(
    password,
    user.password,
  );
  if (!isMatch) {
    return { status: 401, data: { message: 'Invalid password' } };
  }

  const token = authRepository.generateToken(user);

  return {
    status: 200,
    data: { message: 'User logged in successfully', token },
  };
};

export default { registerUser, loginUser };
