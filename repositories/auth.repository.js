import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js';

class AuthRepository {
  async getUserByEmail(email) {
    const [admin, employee] = await Promise.all([
      Admin.findOne({ email }),
      Employee.findOne({ email }),
    ]);
    return admin || employee || null;
  }

  async createUser(UserModel, email, password, name, org) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
      org,
    });
    return newUser.save();
  }

  async passwordsMatch(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(user) {
    // id: user._id, user: user
    return jwt.sign({ id: user._id, user: user }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }

  async getAdminModel() {
    return Admin;
  }

  async getEmployeeModel() {
    return Employee;
  }
}

export default AuthRepository;
