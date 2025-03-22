import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import Quiz from '../../models/quiz.model';
import quizRepository from '../../repositories/quiz.repository.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'testdb' });
});

afterAll(async () => {
  await mongoose.connection.close(); // Ensure all connections are closed
  await mongoServer.stop();
});

afterEach(async () => {
  await Quiz.deleteMany({});
  jest.clearAllMocks();
  jest.clearAllTimers(); // Clear active timers
});

describe('quizRepository', () => {
  test('findLiveQuizByOrgId should return a live quiz for given orgId', async () => {
    const orgId = new ObjectId();
    await Quiz.create({
      orgId,
      status: 'live',
      scheduledDate: new Date(),
      genre: 'PnA',
    });

    const result = await quizRepository.findLiveQuizByOrgId(orgId.toString());
    expect(result).toBeTruthy();
    expect(result.status).toBe('live');
  });

  test('isWeeklyQuizCancelled should return a cancelled quiz for given orgId', async () => {
    const orgId = new ObjectId();
    await Quiz.create({
      orgId,
      status: 'cancelled',
      scheduledDate: new Date(),
      genre: 'CAnIT',
    });

    const result = await quizRepository.isWeeklyQuizCancelled(orgId.toString());
    expect(result).toBeTruthy();
    expect(result.status).toBe('cancelled');
  });

  test('doesWeeklyQuizExist should return a quiz if scheduled for next Friday', async () => {
    const orgId = new ObjectId();
    const dateNextFriday = new Date();
    dateNextFriday.setDate(
      dateNextFriday.getDate() + ((5 - dateNextFriday.getDay() + 7) % 7),
    );

    await Quiz.create({
      orgId,
      scheduledDate: dateNextFriday,
      status: 'upcoming',
      genre: 'HRD',
    });

    const result = await quizRepository.doesWeeklyQuizExist(
      orgId.toString(),
      dateNextFriday,
    );
    expect(result).toBeTruthy();
    expect(result.scheduledDate.toISOString()).toEqual(
      dateNextFriday.toISOString(),
    );
  });

  test('scheduleNewWeeklyQuiz should create a new quiz', async () => {
    const orgId = new ObjectId();
    const dateNextFriday = new Date();
    dateNextFriday.setDate(
      dateNextFriday.getDate() + ((5 - dateNextFriday.getDay() + 7) % 7),
    );
    const genre = 'PnA';

    const result = await quizRepository.scheduleNewWeeklyQuiz(
      orgId.toString(),
      dateNextFriday,
      genre,
    );
    expect(result).toBeTruthy();
    expect(result.genre).toBe(genre);
  });

  test('makeWeeklyQuizLive should update quizzes to live status', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orgId = new ObjectId();

    await Quiz.create({
      orgId,
      scheduledDate: today,
      status: 'approved',
      genre: 'HRD',
    });

    const updateResult = await quizRepository.makeWeeklyQuizLive(today);
    expect(updateResult.modifiedCount).toBe(1);

    const updatedQuiz = await Quiz.findOne({ orgId, scheduledDate: today });
    expect(updatedQuiz.status).toBe('live');
  });
});
