import quizController from '../../controllers/quiz.controller.js';
import questionService from '../../services/question.service.js';
import quizService from '../../services/quiz.service.js';

jest.mock('../../services/question.service.js');
jest.mock('../../services/quiz.service.js');

describe('Quiz Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, data: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getWeeklyQuizStatusController', () => {
    it('should return weekly quiz status', async () => {
      req.data = { orgId: 'org123', employeeId: 'emp456' };
      const mockStatus = { status: 'pending' };
      quizService.getWeeklyQuizStatusService.mockResolvedValue(mockStatus);

      await quizController.getWeeklyQuizStatusController(req, res, next);

      expect(quizService.getWeeklyQuizStatusService).toHaveBeenCalledWith('org123', 'emp456');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatus);
    });

    it('should return 404 if orgId or employeeId is missing', async () => {
      req.data = { orgId: 'org123' };

      await quizController.getWeeklyQuizStatusController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing organizationId' });
    });

    it('should call next with an error on failure', async () => {
      const error = new Error('Service failure');
      quizService.getWeeklyQuizStatusService.mockRejectedValue(error);
    
      req.data = { orgId: 'test-org', employeeId: 'test-emp' };
      await quizController.getWeeklyQuizStatusController(req, res, next);
      expect(next).toHaveBeenCalledTimes(1); // Ensures next is actually called
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getWeeklyQuizQuestions', () => {
    it('should return weekly quiz questions', async () => {
      req.data = { orgId: 'org123' };
      const mockQuestions = [{ id: 'q1', question: 'Sample?' }];
      questionService.getWeeklyQuizQuestions.mockResolvedValue(mockQuestions);

      await quizController.getWeeklyQuizQuestions(req, res, next);

      expect(questionService.getWeeklyQuizQuestions).toHaveBeenCalledWith('org123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestions);
    });

    it('should return 400 if orgId is missing', async () => {
      req.data = {};

      await quizController.getWeeklyQuizQuestions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
  });

  describe('approveWeeklyQuizQuestions', () => {
    it('should approve weekly quiz questions', async () => {
      req.data = { orgId: 'org123' };
      req.body = { questions: ['q1'], questionsToDelete: ['q2'] };
      questionService.approveWeeklyQuizQuestions.mockResolvedValue();

      await quizController.approveWeeklyQuizQuestions(req, res, next);

      expect(questionService.approveWeeklyQuizQuestions).toHaveBeenCalledWith(['q1'], ['q2'], 'org123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Questions marked as approved' });
    });

    it('should return 400 if required fields are missing', async () => {
      req.data = {};

      await quizController.approveWeeklyQuizQuestions(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });
  });

  describe('handleLambdaCallback', () => {
    it('should handle Lambda callback and schedule new questions', async () => {
      req.body = { orgId: 'org123', questions: ['q1'], category: 'Tech', quizId: 'quiz456', file: 'file.txt' };
      questionService.addLambdaCallbackQuestions.mockResolvedValue();

      await quizController.handleLambdaCallback(req, res, next);

      expect(questionService.addLambdaCallbackQuestions).toHaveBeenCalledWith(['q1'], 'Tech', 'org123', 'quiz456', 'file.txt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Scheduled new questions' });
    });

    it('should call next with an error if request body is invalid', async () => {
      req.body = { orgId: 'org123' };

      await quizController.handleLambdaCallback(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error('Invalid request body'));
    });
  });
});