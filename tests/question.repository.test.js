import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import QuestionRepository from '../repositories/question.repository.js';

describe('QuestionRepository (Integration Tests)', () => {
  let mongoServer;
  let questionRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    questionRepository = new QuestionRepository();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Question.deleteMany({});
    await WeeklyQuestion.deleteMany({});
  });

  test('saveQuestion should save a new question', async () => {
    const newQuestion = {
      source: 'AI',
      category: 'CCnHnFF', // Ensure this matches the schema enum
      question: 'What is 2 + 2?',
      answer: 1,
      options: ['1', '4', '3', '5'],
      status: 'extra', // Ensure this matches the schema enum
    };

    const savedQuestion = await questionRepository.saveQuestion(newQuestion);

    expect(savedQuestion).toHaveProperty('_id');
    expect(savedQuestion.question).toBe('What is 2 + 2?');
    expect(savedQuestion.answer).toBe(1);
  });

  test('addQuestions should insert multiple questions', async () => {
    const questions = [
      {
        source: 'AI',
        category: 'CCnHnFF',
        question: 'What is AI?',
        answer: 2,
        options: ['ML', 'DL', 'AI', 'NLP'],
        status: 'extra',
      },
      {
        source: 'Employee',
        category: 'HRD',
        question: 'What is HR?',
        answer: 1,
        options: ['IT', 'HR', 'Finance', 'Admin'],
        status: 'live',
      },
    ];

    await questionRepository.addQuestions(questions);
    const storedQuestions = await Question.find();

    expect(storedQuestions).toHaveLength(2);
    expect(storedQuestions[0].question).toBe('What is AI?');
    expect(storedQuestions[1].question).toBe('What is HR?');
  });

  test('getApprovedWeeklyQuizQuestion should return approved questions', async () => {
    const quizId = new mongoose.Types.ObjectId();
    const orgId = new mongoose.Types.ObjectId();

    await WeeklyQuestion.create({
      isApproved: true,
      quizId,
      orgId,
      question: {
        source: 'Admin',
        category: 'HRD',
        question: 'Who handles employee benefits?',
        answer: 2,
        options: ['Finance', 'Admin', 'HR', 'IT'],
        status: 'done',
      },
    });

    const result =
      await questionRepository.getApprovedWeeklyQuizQuestion(orgId);

    expect(result).toHaveLength(1);
    expect(result[0].question.question).toBe('Who handles employee benefits?');
  });

  test('dropWeeklyQuestionCollection should delete all weekly questions', async () => {
    await WeeklyQuestion.create({
      isApproved: false,
      quizId: new mongoose.Types.ObjectId(),
      orgId: new mongoose.Types.ObjectId(),
      question: {
        source: 'Employee',
        category: 'CCnHnFF',
        question: 'What is teamwork?',
        answer: 1,
        options: ['Individual', 'Collaboration', 'Task', 'None'],
        status: 'live',
      },
    });

    await questionRepository.dropWeeklyQuestionCollection();
    const result = await WeeklyQuestion.find();

    expect(result).toHaveLength(0);
  });

  test('updateWeeklyQuestionsStatusToApproved should update status', async () => {
    const quizId = new mongoose.Types.ObjectId();
    const orgId = new mongoose.Types.ObjectId();
    const questionId = new mongoose.Types.ObjectId();

    await WeeklyQuestion.create({
      isApproved: false,
      quizId,
      orgId,
      question: {
        _id: questionId,
        source: 'Admin',
        category: 'HRD',
        question: 'Who manages employees?',
        answer: 2,
        options: ['Finance', 'Admin', 'HR', 'IT'],
        status: 'live',
      },
    });

    await questionRepository.updateWeeklyQuestionsStatusToApproved([
      questionId,
    ]);

    const updatedQuestion = await WeeklyQuestion.findOne({
      'question._id': questionId,
    });

    expect(updatedQuestion.isApproved).toBe(true);
  });

  test('getCorrectWeeklyQuizAnswers should return answers', async () => {
    const quizId = new mongoose.Types.ObjectId();
    const orgId = new mongoose.Types.ObjectId();
    const questionId = new mongoose.Types.ObjectId();

    await WeeklyQuestion.create({
      quizId,
      orgId,
      question: {
        _id: questionId,
        source: 'Admin',
        category: 'HRD',
        question: 'Who handles hiring?',
        answer: 2,
        options: ['Finance', 'Admin', 'HR', 'IT'],
        status: 'done',
      },
    });

    const result = await questionRepository.getCorrectWeeklyQuizAnswers(orgId);

    expect(result).toHaveLength(1);
    expect(result[0].question._id.toString()).toBe(questionId.toString());
    expect(result[0].question.answer).toBe(2);
  });
});
