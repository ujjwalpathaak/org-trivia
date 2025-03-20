import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js';
import OrgRepository from './org.repository.js';

const orgRepository = new OrgRepository();

class AuthRepository {
  async getUserByEmail(email) {
    const [admin, employee] = await Promise.all([
      Admin.findOne({ email }),
      Employee.findOne({ email }),
    ]);

    return admin || employee || null;
  }

  async createNewUser(UserModel, email, password, name, orgId, isAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await new UserModel({
      email,
      password: hashedPassword,
      name,
      orgId,
    }).save();

    await orgRepository.updateNewUserInOrg(orgId, isAdmin, newUser);

    return newUser;
  }

  async isPasswordsMatch(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateToken(user) {
    return jwt.sign({ id: user._id, user: user }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }
}

export default AuthRepository;
