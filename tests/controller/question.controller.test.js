import questionController from '../../controllers/question.controller.js';
import questionService from '../../services/question.service.js';

jest.mock('../../services/question.service.js');

describe('Question Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, data: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('addQuestion', () => {
    it('should add a question successfully', async () => {
      req.body = { question: 'What is Jest?' };
      req.data = { employeeId: 'emp123' };
      questionService.validateEmployeeQuestionSubmission.mockResolvedValue(
        null,
      );
      questionService.saveQuestion.mockResolvedValue(true);

      await questionController.addQuestion(req, res, next);

      expect(
        questionService.validateEmployeeQuestionSubmission,
      ).toHaveBeenCalledWith('What is Jest?');
      expect(questionService.saveQuestion).toHaveBeenCalledWith(
        'What is Jest?',
        'emp123',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'New question saved successfully',
      });
    });

    it('should return 400 if validation fails', async () => {
      req.body = { question: 'Invalid question' };
      questionService.validateEmployeeQuestionSubmission.mockResolvedValue({
        error: 'Invalid format',
      });

      await questionController.addQuestion(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid format' });
    });

    it('should return 404 if question cannot be saved', async () => {
      req.body = { question: 'Valid question' };
      req.data = { employeeId: 'emp123' };
      questionService.validateEmployeeQuestionSubmission.mockResolvedValue(
        null,
      );
      questionService.saveQuestion.mockResolvedValue(false);

      await questionController.addQuestion(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not able to save question',
      });
    });

    it('should call next with an error on failure', async () => {
      const error = new Error('Service failure');
      questionService.validateEmployeeQuestionSubmission.mockRejectedValue(
        error,
      );

      await questionController.addQuestion(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getWeeklyUnapprovedQuestions', () => {
    it('should return weekly unapproved questions successfully', async () => {
      req.data = { orgId: 'org123' };
      const mockQuiz = { _id: 'quiz123', genre: 'Tech' };
      const mockUnapprovedQuestions = [{ id: 'q1', question: 'Sample?' }];
      const mockExtraQuestions = [{ id: 'q2', question: 'Extra sample?' }];

      questionService.getUpcomingWeeklyQuizByOrgId.mockResolvedValue(mockQuiz);
      questionService.getWeeklyUnapprovedQuestions.mockResolvedValue(
        mockUnapprovedQuestions,
      );
      questionService.getExtraEmployeeQuestions.mockResolvedValue(
        mockExtraQuestions,
      );

      await questionController.getWeeklyUnapprovedQuestions(req, res, next);

      expect(questionService.getUpcomingWeeklyQuizByOrgId).toHaveBeenCalledWith(
        'org123',
      );
      expect(questionService.getWeeklyUnapprovedQuestions).toHaveBeenCalledWith(
        'org123',
        'quiz123',
      );
      expect(questionService.getExtraEmployeeQuestions).toHaveBeenCalledWith(
        'org123',
        'quiz123',
        'Tech',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        weeklyUnapprovedQuestions: mockUnapprovedQuestions,
        extraEmployeeQuestions: mockExtraQuestions,
      });
    });

    it('should return 400 if orgId is missing', async () => {
      req.data = {};

      await questionController.getWeeklyUnapprovedQuestions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required fields',
      });
    });

    it('should return 400 if no upcoming quiz is found', async () => {
      req.data = { orgId: 'org123' };
      questionService.getUpcomingWeeklyQuizByOrgId.mockResolvedValue(null);

      await questionController.getWeeklyUnapprovedQuestions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No questions scheduled till now',
      });
    });
  });

  describe('testScheduleNextWeekQuestionsApproval', () => {
    it('should trigger job scheduling successfully', async () => {
      questionService.scheduleNextWeekQuestionsApproval.mockResolvedValue();

      await questionController.testScheduleNextWeekQuestionsApproval(
        req,
        res,
        next,
      );

      expect(
        questionService.scheduleNextWeekQuestionsApproval,
      ).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith('Job running');
    });

    it('should call next with an error on failure', async () => {
      const error = new Error('Job scheduling failed');
      questionService.scheduleNextWeekQuestionsApproval.mockRejectedValue(
        error,
      );

      await questionController.testScheduleNextWeekQuestionsApproval(
        req,
        res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
