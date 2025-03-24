import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import Employee from '../../models/employee.model.js'; // Ensure Employee model is imported
import Leaderboard from '../../models/leaderboard.model.js';
import badgeRepository from '../../repositories/badge.repository.js';
import employeeRepository from '../../repositories/employee.repository.js';
import leaderboardRepository from '../../repositories/leaderboard.respository.js';

describe('Leaderboard Reset Function', () => {
  let mongoServer;
  let orgId,
    employee1,
    employee2,
    employee3,
    goldBadge,
    silverBadge,
    bronzeBadge;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'testdb' });
    orgId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    await Leaderboard.deleteMany();
    await Employee.deleteMany();

    employee1 = await Employee.create({
      name: 'Alice',
      password: 'hashedpassword',
      email: 'alice@example.com',
      orgId,
      score: 0,
    });
    employee2 = await Employee.create({
      name: 'Bob',
      password: 'hashedpassword',
      email: 'bob@example.com',
      orgId,
      score: 0,
    });
    employee3 = await Employee.create({
      name: 'Charlie',
      password: 'hashedpassword',
      email: 'charlie@example.com',
      orgId,
      score: 0,
    });

    await Leaderboard.create({
      orgId,
      employeeId: employee1._id,
      totalScore: 30,
      month: 2,
      year: 2025,
    });
    await Leaderboard.create({
      orgId,
      employeeId: employee2._id,
      totalScore: 20,
      month: 2,
      year: 2025,
    });
    await Leaderboard.create({
      orgId,
      employeeId: employee3._id,
      totalScore: 10,
      month: 2,
      year: 2025,
    });

    goldBadge = { _id: new mongoose.Types.ObjectId(), rank: 'Gold' };
    silverBadge = { _id: new mongoose.Types.ObjectId(), rank: 'Silver' };
    bronzeBadge = { _id: new mongoose.Types.ObjectId(), rank: 'Bronze' };

    jest
      .spyOn(badgeRepository, 'findBadgeByRank')
      .mockImplementation(async (rank) => {
        return rank === 'Gold'
          ? goldBadge
          : rank === 'Silver'
            ? silverBadge
            : bronzeBadge;
      });

    jest.spyOn(employeeRepository, 'addBadgesToEmployees').mockResolvedValue();
    jest
      .spyOn(employeeRepository, 'resetAllEmployeesScores')
      .mockResolvedValue();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  test('should reset leaderboard and award top 3 employees', async () => {
    const response = await leaderboardRepository.resetLeaderboard(
      3,
      2025,
      2,
      2025,
    );
    expect(response.message).toBe('Leaderboard reset successfully');

    expect(employeeRepository.addBadgesToEmployees).toHaveBeenCalledTimes(3);
    expect(employeeRepository.addBadgesToEmployees).toHaveBeenCalledWith(
      employee1._id,
      goldBadge._id,
      2,
      2025,
    );
    expect(employeeRepository.addBadgesToEmployees).toHaveBeenCalledWith(
      employee2._id,
      silverBadge._id,
      2,
      2025,
    );
    expect(employeeRepository.addBadgesToEmployees).toHaveBeenCalledWith(
      employee3._id,
      bronzeBadge._id,
      2,
      2025,
    );

    expect(employeeRepository.resetAllEmployeesScores).toHaveBeenCalled();
  });
});

describe('Leaderboard Repository', () => {
  let mongoServer;
  let orgId, employee1, employee2;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: 'testdb' });

    orgId = new mongoose.Types.ObjectId();
  });

  const createEmployee = async (overrides = {}) => {
    return Employee.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      orgId,
      streak: 0,
      score: 0,
      quizGiven: false,
      submittedQuestions: [],
      badges: [],
      ...overrides,
    });
  };

  beforeEach(async () => {
    await Leaderboard.deleteMany();
    await Employee.deleteMany(); // Clear employees before each test

    employee1 = await createEmployee();
    employee2 = await createEmployee({
      name: 'John Doe 2',
      email: 'john2@example.com',
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  test('should update leaderboard with correct score', async () => {
    await leaderboardRepository.updateLeaderboard(
      orgId,
      employee1._id,
      10,
      3,
      2025,
    );

    const entry = await Leaderboard.findOne({
      orgId,
      employeeId: employee1._id,
    });
    expect(entry).toBeDefined();
    expect(entry.totalScore).toBe(10);
  });

  test('should increment leaderboard score', async () => {
    await leaderboardRepository.updateLeaderboard(
      orgId,
      employee1._id,
      10,
      3,
      2025,
    );
    await leaderboardRepository.updateLeaderboard(
      orgId,
      employee1._id,
      5,
      3,
      2025,
    );

    const entry = await Leaderboard.findOne({
      orgId,
      employeeId: employee1._id,
    });
    expect(entry.totalScore).toBe(15);
  });

  test('should fetch leaderboard sorted by totalScore', async () => {
    await leaderboardRepository.updateLeaderboard(
      orgId,
      employee1._id,
      20,
      3,
      2025,
    );
    await leaderboardRepository.updateLeaderboard(
      orgId,
      employee2._id,
      30,
      3,
      2025,
    );

    const leaderboard = await leaderboardRepository.getLeaderboardByOrg(
      orgId,
      3,
      2025,
    );
    expect(leaderboard.length).toBe(2);
    expect(leaderboard[0].totalScore).toBe(30); // Highest score first
  });
});
