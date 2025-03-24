import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import Employee from '../../models/employee.model.js';
import Question from '../../models/question.model.js';
import EmployeeRepository from '../../repositories/employee.repository.js';

let mongoServer;

beforeAll(async () => {
  // Start MongoDB In-Memory Server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose to In-Memory Database
  await mongoose.connect(uri, { dbName: 'testDB' });
});

afterAll(async () => {
  // Close Database Connection and Stop Server
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await Employee.deleteMany({});
});

const createEmployee = async (overrides = {}) => {
  return Employee.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    orgId: new mongoose.Types.ObjectId(),
    streak: 0,
    score: 0,
    quizGiven: false,
    submittedQuestions: [],
    badges: [],
    ...overrides,
  });
};

const createEmployee2 = async (overrides = {}) => {
  return Employee.create({
    name: 'John Doe 2',
    email: 'john2@example.com',
    password: 'hashedpassword2',
    orgId: new mongoose.Types.ObjectId(),
    streak: 0,
    score: 0,
    quizGiven: false,
    submittedQuestions: [],
    badges: [],
    ...overrides,
  });
};

describe('Employee Repository Tests', () => {
  test('should check if weekly quiz is given', async () => {
    const employee = await createEmployee({ quizGiven: true });
    const employee2 = await createEmployee2({ quizGiven: true });

    const result = await EmployeeRepository.isWeeklyQuizGiven(employee._id);
    const result2 = await EmployeeRepository.isWeeklyQuizGiven(employee2._id);

    expect(result.quizGiven).toBe(true);
    expect(result2.quizGiven).toBe(true);
  });

  test('should update employee streaks and reset quizGiven', async () => {
    await createEmployee({ quizGiven: true, streak: 2 });
    await createEmployee2({ quizGiven: false, streak: 5 });

    await EmployeeRepository.updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven();

    const employees = await Employee.find();

    expect(employees[0].quizGiven).toBe(false);
    expect(employees[1].quizGiven).toBe(false);
  });

  test('should add submitted question', async () => {
    const employee = await createEmployee();

    await EmployeeRepository.addSubmittedQuestion(
      new mongoose.Types.ObjectId(),
      employee._id,
    );

    const updatedEmployee = await Employee.findById(employee._id);
    expect(updatedEmployee.submittedQuestions.length).toBe(1);
  });

  test('should update weekly quiz score', async () => {
    const employee = await createEmployee({ quizGiven: false, streak: 2 });

    const result = await EmployeeRepository.updateWeeklyQuizScore(
      employee._id,
      10,
    );
    const updatedEmployee = await Employee.findById(employee._id);

    expect(result).toHaveProperty('score');
    expect(updatedEmployee.quizGiven).toBe(true);
    expect(updatedEmployee.score).toBeGreaterThan(0);
  });

  test('should add badge to employee', async () => {
    const employee = await createEmployee();

    await EmployeeRepository.addBadgesToEmployees(
      employee._id,
      new mongoose.Types.ObjectId(),
      3,
      2025,
    );

    const updatedEmployee = await Employee.findById(employee._id);
    expect(updatedEmployee.badges.length).toBe(1);
  });

  test('should reset all employee scores and streaks', async () => {
    await createEmployee({ score: 100, streak: 3 });
    await createEmployee2({ score: 50, streak: 1 });

    await EmployeeRepository.resetAllEmployeesScores();

    const employees = await Employee.find();
    expect(employees.every((e) => e.score === 0 && e.streak === 0)).toBe(true);
  });

  test('should get submitted questions', async () => {
    const questionId = new mongoose.Types.ObjectId();

    await Question.create({
      _id: questionId,
      source: 'Employee',
      category: 'HRD',
      image: 'https://example.com/question-image.png',
      question: 'What is the primary role of HR in an organization?',
      answer: 2,
      options: [
        'Managing company finances',
        'Developing software products',
        'Handling employee relations and recruitment',
        'Overseeing legal affairs',
      ],
      config: {
        difficulty: 'medium',
        timeLimit: 30,
      },
    });

    const employee = await Employee.create({
      _id: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test Employee',
      orgId: new mongoose.Types.ObjectId(),
      submittedQuestions: [questionId],
    });

    const result = await EmployeeRepository.getSubmittedQuestions(
      employee._id,
      0,
      10,
    );

    expect(result.total).toBe(1);
    expect(result.data.length).toBe(1);
    expect(result.data[0]._id.toString()).toBe(questionId.toString());
    expect(result.data[0].question).toBe(
      'What is the primary role of HR in an organization?',
    );
  });

  test('should get employee details with badges', async () => {
    const employee = await createEmployee({ streak: 5 });

    const result = await EmployeeRepository.getEmployeeDetails(employee._id);

    expect(result).toHaveProperty('employee');
    expect(result).toHaveProperty('badges');
  });
});
