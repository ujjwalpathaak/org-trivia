import { ObjectId } from 'mongodb';

import {
  fetchNewCAnITQuestions,
  fetchNewPnAQuestions,
} from '../../api/lambda.api.js';
import employeeRepository from '../../repositories/employee.repository.js';
import orgRepository from '../../repositories/org.repository.js';
import questionRepository from '../../repositories/question.repository.js';
import quizRepository from '../../repositories/quiz.repository.js';
import questionService from '../../services/question.service.js';

jest.mock('../../repositories/employee.repository.js');
jest.mock('../../repositories/org.repository.js');
jest.mock('../../repositories/question.repository.js');
// jest.mock('../../services/question.service.js');
jest.mock('../../repositories/quiz.repository.js');
jest.mock('../../api/lambda.api.js');

describe('questionService', () => {
  describe('saveQuestion', () => {
    it('should save a question and add it to the org and employee', async () => {
      const newQuestionData = { orgId: 'org123', question: 'Test question' };
      const employeeId = 'emp123';
      const savedQuestion = { _id: new ObjectId(), ...newQuestionData };

      questionRepository.saveQuestion.mockResolvedValue(savedQuestion);
      orgRepository.addQuestionToOrg.mockResolvedValue(true);
      employeeRepository.addSubmittedQuestion.mockResolvedValue(true);

      const result = await questionService.saveQuestion(
        newQuestionData,
        employeeId,
      );

      expect(questionRepository.saveQuestion).toHaveBeenCalledWith(
        newQuestionData,
      );
      expect(orgRepository.addQuestionToOrg).toHaveBeenCalledWith(
        savedQuestion,
        'org123',
      );
      expect(employeeRepository.addSubmittedQuestion).toHaveBeenCalledWith(
        savedQuestion._id,
        employeeId,
      );
      expect(result).toBe(true);
    });
  });

  describe('getExtraEmployeeQuestions', () => {
    it('should fetch and format extra employee questions', async () => {
      const orgId = 'org123';
      const quizId = 'quiz123';
      const quizGenre = 'genre1';
      const employeeQuestions = [
        { question: 'Question 1', category: 'genre1' },
        { question: 'Question 2', category: 'genre1' },
      ];
      const formattedQuestions = [
        {
          isApproved: false,
          quizId,
          question: 'Question 1',
          orgId,
          type: 'extra',
        },
        {
          isApproved: false,
          quizId,
          question: 'Question 2',
          orgId,
          type: 'extra',
        },
      ];

      const mockFormattedQuestions = [
        { category: "genre1", question: "Question 1" },
        { category: "genre1", question: "Question 2" }
      ];

      jest.spyOn(questionService, 'formatQuestionsWeeklyFormat').mockReturnValue(mockFormattedQuestions);

      questionRepository.getExtraEmployeeQuestions.mockResolvedValue(
        employeeQuestions,
      );
      questionService.formatQuestionsWeeklyFormat = jest
        .fn()
        .mockReturnValue(formattedQuestions);

      const result = await questionService.getExtraEmployeeQuestions(
        orgId,
        quizId,
        quizGenre,
      );

      expect(questionRepository.getExtraEmployeeQuestions).toHaveBeenCalledWith(
        orgId,
        quizId,
        quizGenre,
      );
    });
  });

  describe('approveWeeklyQuizQuestions', () => {
    it('should approve weekly quiz questions', async () => {
      const unapprovedQuestions = [
        {
          question: {
            _id: new ObjectId(),
            category: 'genre1',
            source: 'Employee',
          },
          quizId: 'quiz123',
        },
        {
          question: { _id: new ObjectId(), category: 'genre1', source: 'AI' },
          quizId: 'quiz123',
        },
      ];
      const questionsToDelete = [{ question: { _id: new ObjectId() } }];
      const orgId = 'org123';

      orgRepository.updateQuestionsStatusInOrgToUsed.mockResolvedValue(true);
      quizRepository.updateQuizStatusToApproved.mockResolvedValue(true);
      questionRepository.updateWeeklyQuestionsStatusToApproved.mockResolvedValue(
        true,
      );

      const result = await questionService.approveWeeklyQuizQuestions(
        unapprovedQuestions,
        questionsToDelete,
        orgId,
      );

      expect(
        orgRepository.updateQuestionsStatusInOrgToUsed,
      ).toHaveBeenCalledWith(
        orgId,
        'genre1',
        unapprovedQuestions.map((q) => new ObjectId(q.question._id)),
        questionsToDelete.map((q) => new ObjectId(q.question._id)),
      );
      expect(quizRepository.updateQuizStatusToApproved).toHaveBeenCalledWith(
        'quiz123',
      );
      expect(
        questionRepository.updateWeeklyQuestionsStatusToApproved,
      ).toHaveBeenCalledWith(
        unapprovedQuestions.map((q) => new ObjectId(q.question._id)),
        unapprovedQuestions.filter((q) => q.question.source === 'Employee'),
        questionsToDelete.map((q) => new ObjectId(q.question._id)),
      );
      expect(result).toEqual({ message: 'Questions approved.' });
    });
  });

  describe('getUpcomingWeeklyQuizByOrgId', () => {
    it('should get upcoming weekly quiz by orgId', async () => {
      const orgId = 'org123';
      const upcomingQuiz = { quizId: 'quiz123', questions: [] };

      quizRepository.getUpcomingWeeklyQuiz.mockResolvedValue(upcomingQuiz);

      const result = await questionService.getUpcomingWeeklyQuizByOrgId(orgId);

      expect(quizRepository.getUpcomingWeeklyQuiz).toHaveBeenCalledWith(orgId);
      expect(result).toEqual(upcomingQuiz);
    });
  });

  describe('getWeeklyUnapprovedQuestions', () => {
    it('should get weekly unapproved questions', async () => {
      const orgId = 'org123';
      const quizId = 'quiz123';
      const unapprovedQuestions = [
        { question: 'Question 1', isApproved: false },
        { question: 'Question 2', isApproved: false },
      ];

      questionRepository.getWeeklyUnapprovedQuestions.mockResolvedValue(
        unapprovedQuestions,
      );

      const result = await questionService.getWeeklyUnapprovedQuestions(
        orgId,
        quizId,
      );

      expect(
        questionRepository.getWeeklyUnapprovedQuestions,
      ).toHaveBeenCalledWith(quizId);
      expect(result).toEqual(unapprovedQuestions);
    });
  });

  describe('getWeeklyQuizCorrectAnswers', () => {
    it('should get weekly quiz correct answers', async () => {
      const orgId = 'org123';
      const correctAnswers = [
        { question: 'Question 1', answer: 'Answer 1' },
        { question: 'Question 2', answer: 'Answer 2' },
      ];

      questionRepository.getCorrectWeeklyQuizAnswers.mockResolvedValue(
        correctAnswers,
      );

      const result = await questionService.getWeeklyQuizCorrectAnswers(orgId);

      expect(
        questionRepository.getCorrectWeeklyQuizAnswers,
      ).toHaveBeenCalledWith(orgId);
      expect(result).toEqual(correctAnswers.map((curr) => curr.question));
    });
  });

  describe('fetchHRDQuestions', () => {
    it('should fetch HRD questions', async () => {
      const orgId = 'org123';
      const hrdQuestions = [
        { question: 'Question 1', category: 'HRD' },
        { question: 'Question 2', category: 'HRD' },
      ];

      orgRepository.fetchHRDQuestions.mockResolvedValue(hrdQuestions);

      const result = await questionService.fetchHRDQuestions(orgId);

      expect(orgRepository.fetchHRDQuestions).toHaveBeenCalledWith(orgId);
      expect(result).toEqual(hrdQuestions);
    });
  });

  describe('getWeeklyQuizQuestions', () => {
    it('should get weekly quiz questions', async () => {
      const orgId = 'org123';
      const approvedQuestions = [
        { question: 'Question 1', quizId: 'quiz123' },
        { question: 'Question 2', quizId: 'quiz123' },
      ];

      questionRepository.getApprovedWeeklyQuizQuestion.mockResolvedValue(
        approvedQuestions,
      );

      const result = await questionService.getWeeklyQuizQuestions(orgId);

      expect(
        questionRepository.getApprovedWeeklyQuizQuestion,
      ).toHaveBeenCalledWith(orgId);
      expect(result).toEqual({
        weeklyQuizQuestions: approvedQuestions.map((ques) => ques.question),
        quizId: 'quiz123',
      });
    });
  });

  describe('startHRDWorkflow', () => {
    it('should start HRD workflow', async () => {
      const orgId = 'org123';
      const quizId = 'quiz123';
      const hrdQuestions = [
        { question: 'Question 1', category: 'HRD' },
        { question: 'Question 2', category: 'HRD' },
      ];

      questionRepository.fetchHRDQuestions.mockResolvedValue(hrdQuestions);
      questionService.pushQuestionsForApprovals = jest.fn().mockResolvedValue(true);


      await questionService.startHRDWorkflow(orgId, quizId);

      expect(questionRepository.fetchHRDQuestions).toHaveBeenCalledWith(orgId);
    });
  });
});

describe('startQuestionGenerationWorkflow', () => {
  it('should start PnA workflow', async () => {
    const genre = 'PnA';
    const element = { name: 'Org Name', _id: 'org123' };
    const quizId = 'quiz123';

    await questionService.startQuestionGenerationWorkflow(
      genre,
      element,
      quizId,
    );

    expect(fetchNewPnAQuestions).toHaveBeenCalledWith(
      'Org Name',
      'org123',
      'quiz123',
    );
  });

  it('should start CAnIT workflow', async () => {
    const genre = 'CAnIT';
    const element = {
      name: 'Org Name',
      orgIndustry: 'Industry',
      orgCountry: 'Country',
      _id: 'org123',
    };
    const quizId = 'quiz123';

    await questionService.startQuestionGenerationWorkflow(
      genre,
      element,
      quizId,
    );

    expect(fetchNewCAnITQuestions).toHaveBeenCalledWith(
      'Org Name',
      'Industry',
      'Country',
      'org123',
      'quiz123',
    );
  });
});

describe('validateEmployeeQuestionSubmission', () => {
  it('should return 0 if question is valid', async () => {
    const question = {
      question: 'Test question',
      category: 'PnA',
      config: { puzzleType: 'type1' },
      options: ['opt1', 'opt2', 'opt3', 'opt4'],
      answer: 'opt1',
    };

    const result =
      await questionService.validateEmployeeQuestionSubmission(question);

    expect(result).toBe(0);
  });

  it('should return the number of validation errors', async () => {
    const question = {
      question: '',
      category: 'PnA',
      config: { puzzleType: 'type1' },
      options: ['opt1', 'opt2'],
      answer: '',
    };

    const result =
      await questionService.validateEmployeeQuestionSubmission(question);

    expect(result).toBe(3);
  });
});
