import employeeController from '../../controllers/employee.controller.js';
import employeeService from '../../services/employee.service.js';

jest.mock('../../services/employee.service.js');

describe('Employee Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { data: { employeeId: 'emp123' }, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getEmployeeDetails', () => {
    it('should return employee details if employeeId is provided', async () => {
      const mockEmployeeDetails = { id: 'emp123', name: 'John Doe' };
      employeeService.fetchEmployeeDetails.mockResolvedValue(
        mockEmployeeDetails,
      );

      await employeeController.getEmployeeDetails(req, res, next);

      expect(employeeService.fetchEmployeeDetails).toHaveBeenCalledWith(
        'emp123',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEmployeeDetails);
    });

    it('should return 400 if employeeId is missing', async () => {
      req.data = {}; // No employeeId

      await employeeController.getEmployeeDetails(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required fields',
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Database error');
      employeeService.fetchEmployeeDetails.mockRejectedValue(error);

      await employeeController.getEmployeeDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getSubmittedQuestionsController', () => {
    it('should return submitted questions with default pagination', async () => {
      const mockQuestions = [{ id: 'q1', question: 'Sample Question' }];
      employeeService.fetchSubmittedQuestions.mockResolvedValue(mockQuestions);

      await employeeController.getSubmittedQuestionsController(req, res, next);

      expect(employeeService.fetchSubmittedQuestions).toHaveBeenCalledWith(
        'emp123',
        0,
        10,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestions);
    });

    it('should return submitted questions with provided pagination', async () => {
      req.query = { page: '2', size: '5' };
      const mockQuestions = [{ id: 'q2', question: 'Another Question' }];
      employeeService.fetchSubmittedQuestions.mockResolvedValue(mockQuestions);

      await employeeController.getSubmittedQuestionsController(req, res, next);

      expect(employeeService.fetchSubmittedQuestions).toHaveBeenCalledWith(
        'emp123',
        '2',
        '5',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestions);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Service error');
      employeeService.fetchSubmittedQuestions.mockRejectedValue(error);

      await employeeController.getSubmittedQuestionsController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
