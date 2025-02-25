class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async registerUser(isAdmin, email, password, name, org) {
    const [UserModel, userType] = isAdmin
      ? [this.authRepository.getAdminModel(), 'Admin']
      : [this.authRepository.getEmployeeModel(), 'Employee'];

    const user = await this.authRepository.getUserByEmail(email);
    if (user) {
      return { status: 400, data: { message: `This email already exists` } };
    }

    if (!org || Object.keys(org).length === 0) {
      return { status: 400, data: { message: `No such organisation exists` } };
    }

    await this.authRepository.createUser(UserModel, email, password, name, org);

    return {
      status: 201,
      data: { message: `New ${userType} registered successfully` },
    };
  }

  async loginUser(email, password) {
    const user = await this.authRepository.getUserByEmail(email);
    if (!user) {
      return { status: 404, data: { message: 'User not found!' } };
    }

    const isMatch = await this.authRepository.passwordsMatch(
      password,
      user.password,
    );
    if (!isMatch) {
      return { status: 401, data: { message: 'Invalid password' } };
    }

    const token = this.authRepository.generateToken(user);

    return {
      status: 200,
      data: { message: 'User logged in successfully', token },
    };
  }
}

export default AuthService;
