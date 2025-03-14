import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js';
import Org from '../models/org.model.js';

import { ObjectId } from 'mongodb';

class AuthRepository {
  async getUserByEmail(email) {
    const [admin, employee] = await Promise.all([
      Admin.findOne({ email }),
      Employee.findOne({ email }),
    ]);

    return admin || employee || null;
  }

  async createUser(UserModel, email, password, name, orgId, isAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await new UserModel({
      email,
      password: hashedPassword,
      name,
      orgId,
    }).save();

    await Org.updateOne(
      { _id: new ObjectId(orgId) },
      { $push: { [isAdmin ? 'admins' : 'employees']: newUser._id } },
    );

    return newUser;
  }

  async passwordsMatch(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
  }

  generateToken(user) {
    return jwt.sign({ id: user._id, user: user }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }
}

export default AuthRepository;
