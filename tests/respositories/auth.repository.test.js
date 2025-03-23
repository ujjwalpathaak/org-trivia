import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import Admin from '../../models/admin.model.js';
import Employee from '../../models/employee.model.js';
import authRepository from '../../repositories/auth.repository.js';
import orgRepository from '../../repositories/org.repository.js';

// Load environment variables
dotenv.config();

// Start in-memory MongoDB
let mongoServer;

jest.mock('../../repositories/org.repository.js'); // Mock external dependency

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await Admin.deleteMany({});
  await Employee.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth Repository', () => {
  it('should create a new employee user', async () => {
    orgRepository.updateNewUserInOrg.mockResolvedValueOnce(null); // Mock org update

    const orgId = new mongoose.Types.ObjectId();
    const employee = await authRepository.createNewUser(
      Employee,
      'test@example.com',
      'password123',
      'Test User',
      orgId,
      false,
    );

    expect(employee).toBeDefined();
    expect(employee.email).toBe('test@example.com');
    expect(employee.name).toBe('Test User');
    expect(employee.orgId).toEqual(orgId);

    const isMatch = await bcrypt.compare('password123', employee.password);
    expect(isMatch).toBe(true);
  });

  it('should create a new admin user', async () => {
    orgRepository.updateNewUserInOrg.mockResolvedValueOnce(null);

    const orgId = new mongoose.Types.ObjectId();
    const admin = await authRepository.createNewUser(
      Admin,
      'admin@example.com',
      'adminpass',
      'Admin User',
      orgId,
      true,
    );

    expect(admin).toBeDefined();
    expect(admin.email).toBe('admin@example.com');
    expect(admin.name).toBe('Admin User');
    expect(admin.orgId).toEqual(orgId);

    const isMatch = await bcrypt.compare('adminpass', admin.password);
    expect(isMatch).toBe(true);
  });

  it('should retrieve a user by email', async () => {
    const orgId = new mongoose.Types.ObjectId();
    await Employee.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'findme@example.com',
      password: 'hashedpass',
      name: 'Find Me',
      orgId,
    });

    const user = await authRepository.getUserByEmail('findme@example.com');
    expect(user).toBeDefined();
    expect(user.email).toBe('findme@example.com');
    expect(user.name).toBe('Find Me');
    expect(user.orgId).toEqual(orgId);
  });

  it('should return null if user is not found', async () => {
    const user = await authRepository.getUserByEmail('notfound@example.com');
    expect(user).toBeNull();
  });

  it('should compare passwords correctly', async () => {
    const hashedPassword = await bcrypt.hash('mypassword', 10);
    const isMatch = await authRepository.isPasswordsMatch(
      'mypassword',
      hashedPassword,
    );
    expect(isMatch).toBe(true);
  });

  it('should generate a valid JWT token', () => {
    const user = {
      _id: new mongoose.Types.ObjectId(),
      role: 'employee',
      name: 'John Doe',
      orgId: new mongoose.Types.ObjectId(),
    };

    const token = authRepository.generateToken(user);
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.employeeId).toEqual(user._id.toString());
    expect(decoded.role).toBe('employee');
    expect(decoded.name).toBe('John Doe');
    expect(decoded.orgId).toEqual(user.orgId.toString());
  });
});
