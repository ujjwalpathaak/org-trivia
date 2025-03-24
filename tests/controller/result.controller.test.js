import resultController from '../../controllers/result.controller.js';
import resultService from '../../services/result.service.js';

jest.mock('../../services/result.service.js');

describe('Result Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, data: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('submitWeeklyQuizAnswersController', () => {
    it('should submit quiz answers successfully', async () => {
      req.body = { answers: [{ q: 'q1', a: 'a1' }], quizId: 'quiz123' };
      req.data = { employeeId: 'emp123', orgId: 'org456' };

      const mockResponse = { success: true, data: { score: 90 } };
      resultService.submitWeeklyQuizAnswersService.mockResolvedValue(
        mockResponse,
      );

      await resultController.submitWeeklyQuizAnswersController(req, res, next);

      expect(resultService.submitWeeklyQuizAnswersService).toHaveBeenCalledWith(
        req.body.answers,
        req.data.employeeId,
        req.data.orgId,
        req.body.quizId,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Submitted weekly quiz answers',
        data: mockResponse,
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { answers: null, quizId: 'quiz123' };
      req.data = { employeeId: 'emp123', orgId: 'org456' };

      await resultController.submitWeeklyQuizAnswersController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All fields are required',
      });
    });

    it('should return 400 if service returns failure', async () => {
      req.body = { answers: [{ q: 'q1', a: 'a1' }], quizId: 'quiz123' };
      req.data = { employeeId: 'emp123', orgId: 'org456' };

      const mockResponse = { success: false, message: 'Invalid answers' };
      resultService.submitWeeklyQuizAnswersService.mockResolvedValue(
        mockResponse,
      );

      await resultController.submitWeeklyQuizAnswersController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid answers',
        data: null,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Service error');
      req = {
        body: {
          answers: ['A', 'B', 'C'], // Sample answers
          quizId: 'quiz123',
        },
        data: {
          employeeId: 'emp456',
          orgId: 'org789',
        },
      };
      resultService.submitWeeklyQuizAnswersService.mockRejectedValue(error);

      await resultController.submitWeeklyQuizAnswersController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getEmployeePastResultsController', () => {
    it('should return past quiz results', async () => {
      req.data = { employeeId: 'emp123' };
      req.query = { page: '1', size: '5' };

      const mockResults = [{ quizId: 'quiz1', score: 85 }];
      resultService.getEmployeePastResultsService.mockResolvedValue(
        mockResults,
      );

      await resultController.getEmployeePastResultsController(req, res, next);

      expect(resultService.getEmployeePastResultsService).toHaveBeenCalledWith(
        'emp123',
        '1',
        '5',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it('should return 400 if employeeId is missing', async () => {
      req.data = {}; // No employeeId

      await resultController.getEmployeePastResultsController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required fields',
      });
    });
  });
});
