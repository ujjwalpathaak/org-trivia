import { jest } from '@jest/globals';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

import Admin from '../models/admin.model.js';
import Employee from '../models/employee.model.js';
import AuthRepository from '../repositories/auth.repository.js';
import OrgRepository from '../repositories/org.repository.js';

jest.mock('../repositories/org.repository.js');

const authRepository = new AuthRepository();

describe('AuthRepository (Integration Tests)', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Admin.deleteMany({});
    await Employee.deleteMany({});
  });

  test('getUserByEmail should return an admin if email exists in Admin collection', async () => {
    const admin = await Admin.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashedpassword',
      orgId: new mongoose.Types.ObjectId(),
    });

    const result = await authRepository.getUserByEmail('admin@example.com');
    expect(result).toBeDefined();
    expect(result.email).toBe('admin@example.com');
  });

  test('getUserByEmail should return an employee if email exists in Employee collection', async () => {
    const employee = await Employee.create({
      name: 'Employee User',
      email: 'employee@example.com',
      password: 'hashedpassword',
      orgId: new mongoose.Types.ObjectId(),
    });

    const result = await authRepository.getUserByEmail('employee@example.com');
    expect(result).toBeDefined();
    expect(result.email).toBe('employee@example.com');
  });

  test('createNewUser should create and return a new user', async () => {
    const orgId = new mongoose.Types.ObjectId();
    const email = 'newuser@example.com';
    const password = 'password123';
    const name = 'New User';
    const isAdmin = false;

    const newUser = await authRepository.createNewUser(Employee, email, password, name, orgId, isAdmin);

    expect(newUser).toBeDefined();
    expect(newUser.email).toBe(email);
    const isMatch = await bcrypt.compare(password, newUser.password);
    expect(isMatch).toBe(true);
  });

  test('isPasswordsMatch should return true for correct passwords', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await authRepository.isPasswordsMatch(password, hashedPassword);
    expect(result).toBe(true);
  });

});
