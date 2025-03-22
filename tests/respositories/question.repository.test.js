import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import Question from '../../models/question.model.js';
import WeeklyQuestion from '../../models/weeklyQuestion.model.js';
import orgRepository from '../../repositories/org.repository.js';
import questionRepository from '../../repositories/question.repository.js';
import quizRepository from '../../repositories/quiz.repository.js';

jest.mock('../../repositories/org.repository.js');
jest.mock('../../repositories/quiz.repository.js');

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
  await Question.deleteMany({});
  await WeeklyQuestion.deleteMany({});
  jest.clearAllMocks();
  jest.clearAllTimers(); // Clear active timers
});

describe('questionRepository', () => {
  test('saveQuestion should save a valid question', async () => {
    const newQuestion = {
      source: 'AI',
      category: 'HRD',
      question: 'What is MongoDB?',
      answer: 2,
      options: ['SQL DB', 'Graph DB', 'NoSQL DB', 'None'],
    };

    const savedQuestion = await questionRepository.saveQuestion(newQuestion);

    expect(savedQuestion).toBeTruthy();
    expect(savedQuestion.question).toBe(newQuestion.question);
    expect(savedQuestion.options.length).toBe(4);
    expect(savedQuestion.answer).toBe(2);
  });

  test('addQuestions should insert only new questions', async () => {
    await Question.create({
      source: 'AI',
      category: 'HRD',
      question: 'What is Node.js?',
      answer: 1,
      options: ['Database', 'Runtime', 'Library', 'OS'],
    });

    const newQuestions = [
      {
        source: 'AI',
        category: 'HRD',
        question: 'What is Node.js?',
        answer: 1,
        options: ['Database', 'Runtime', 'Library', 'OS'],
      }, // Already exists
      {
        source: 'Admin',
        category: 'CCnHnFF',
        question: 'What is Express.js?',
        answer: 0,
        options: ['Framework', 'DB', 'API', 'None'],
      }, // New
    ];

    const insertedQuestions =
      await questionRepository.addQuestions(newQuestions);

    expect(insertedQuestions.length).toBe(1);
    expect(insertedQuestions[0].question).toBe('What is Express.js?');
  });

  test('getApprovedWeeklyQuizQuestion should return only approved questions', async () => {
    const orgId = new mongoose.Types.ObjectId();
    await WeeklyQuestion.create({
      orgId,
      quizId: new mongoose.Types.ObjectId(),
      type: 'main',
      question: {
        source: 'Employee',
        category: 'HRD',
        question: 'Approved question?',
        answer: 3,
        options: ['A', 'B', 'C', 'D'],
      },
      isApproved: true,
    });

    const result =
      await questionRepository.getApprovedWeeklyQuizQuestion(orgId);

    expect(result.length).toBe(1);
    expect(result[0].isApproved).toBe(true);
  });

  test('dropWeeklyQuestionCollection should delete all weekly questions', async () => {
    await WeeklyQuestion.create({
      orgId: new mongoose.Types.ObjectId(),
      quizId: new mongoose.Types.ObjectId(),
      type: 'main',
      question: {
        source: 'Admin',
        category: 'CAnIT',
        question: 'Sample?',
        answer: 1,
        options: ['Opt1', 'Opt2', 'Opt3', 'Opt4'],
      },
      isApproved: true,
    });

    await questionRepository.dropWeeklyQuestionCollection();
    const remainingQuestions = await WeeklyQuestion.find();

    expect(remainingQuestions.length).toBe(0);
  });

  test('updateWeeklyQuestionsStatusToApproved should update question statuses', async () => {
    const question1 = new mongoose.Types.ObjectId();
    const question2 = new mongoose.Types.ObjectId();
    await WeeklyQuestion.create({
      orgId: new mongoose.Types.ObjectId(),
      quizId: new mongoose.Types.ObjectId(),
      type: 'main',
      question: {
        source: 'Admin',
        category: 'CAnIT',
        question: 'Sample?',
        answer: 1,
        options: ['Opt1', 'Opt2', 'Opt3', 'Opt4'],
        _id: question1,
      },
      isApproved: false,
    });
    const ids = [question1];
    const employeeQuestionsToAdd = [
      {
        _id: question2,
        orgId: new mongoose.Types.ObjectId(),
        quizId: new mongoose.Types.ObjectId(),
        type: 'extra',
        question: {
          source: 'Admin',
          category: 'CAnIT',
          question: 'Sample?',
          answer: 1,
          options: ['Opt1', 'Opt2', 'Opt3', 'Opt4'],
        },
        isApproved: false,
      },
    ];
    const idsOfQuestionsToDelete = [];

    await questionRepository.updateWeeklyQuestionsStatusToApproved(
      ids,
      employeeQuestionsToAdd,
      idsOfQuestionsToDelete,
    );

    const updatedQuestion = await WeeklyQuestion.findOne({});
    expect(updatedQuestion.isApproved).toBe(true);
  });

  test('getCorrectWeeklyQuizAnswers should return question answers', async () => {
    const orgId = new mongoose.Types.ObjectId();
    await WeeklyQuestion.create({
      orgId,
      quizId: new mongoose.Types.ObjectId(),
      type: 'main',
      question: {
        _id: new mongoose.Types.ObjectId(),
        source: 'Employee',
        category: 'PnA',
        question: 'Find answer',
        answer: 2,
        options: ['A', 'B', 'C', 'D'],
      },
    });

    const result = await questionRepository.getCorrectWeeklyQuizAnswers(orgId);

    expect(result.length).toBe(1);
    expect(result[0].question.answer).toBe(2);
  });

  test('saveWeeklyQuizQuestions should update quiz status and save questions', async () => {
    quizRepository.updateQuizStatus.mockResolvedValue(true);

    const quizId = new mongoose.Types.ObjectId();
    const newQuestions = [
      {
        quizId,
        orgId: new mongoose.Types.ObjectId(),
        type: 'main',
        question: {
          source: 'Admin',
          category: 'HRD',
          question: 'New Weekly Question?',
          answer: 1,
          options: ['Opt1', 'Opt2', 'Opt3', 'Opt4'],
        },
      },
    ];

    const result = await questionRepository.saveWeeklyQuizQuestions(
      quizId,
      newQuestions,
    );

    expect(result.length).toBe(1);
    expect(result[0].question.question).toBe('New Weekly Question?');
    expect(quizRepository.updateQuizStatus).toHaveBeenCalledWith(
      quizId,
      'unapproved',
    );
  });

  test('getExtraEmployeeQuestions should fetch extra employee questions', async () => {
    orgRepository.fetchExtraEmployeeQuestions.mockResolvedValue([
      { question: 'Extra Question' },
    ]);

    const orgId = new mongoose.Types.ObjectId();
    const quizId = new mongoose.Types.ObjectId();
    const genre = 'HRD';

    const result = await questionRepository.getExtraEmployeeQuestions(
      orgId,
      quizId,
      genre,
    );

    expect(result.length).toBe(1);
    expect(result[0].question).toBe('Extra Question');
  });

  test('getWeeklyUnapprovedQuestions should fetch unapproved weekly questions', async () => {
    const quizId = new mongoose.Types.ObjectId();
    await WeeklyQuestion.create({
      orgId: new mongoose.Types.ObjectId(),
      quizId,
      type: 'main',
      question: {
        source: 'AI',
        category: 'PnA',
        question: 'Unapproved?',
        answer: 3,
        options: ['1', '2', '3', '4'],
      },
      isApproved: false,
    });

    const result =
      await questionRepository.getWeeklyUnapprovedQuestions(quizId);

    expect(result.length).toBe(1);
    expect(result[0].question.question).toBe('Unapproved?');
  });

  test('fetchHRDQuestions should fetch HRD questions from orgRepository', async () => {
    orgRepository.fetchHRDQuestions.mockResolvedValue([
      { question: 'HRD Question' },
    ]);

    const orgId = new mongoose.Types.ObjectId();
    const result = await questionRepository.fetchHRDQuestions(orgId);

    expect(result.length).toBe(1);
    expect(result[0].question).toBe('HRD Question');
  });
});
