import employeeService from '../../services/employee.service.js';
import employeeRepository from '../../repositories/employee.repository.js';

jest.mock('../../repositories/employee.repository.js');

describe('Employee Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchEmployeeDetails', () => {
    it('should return employee details', async () => {
      const mockEmployee = { id: 1, name: 'John Doe', role: 'Developer' };
      employeeRepository.getEmployeeDetails.mockResolvedValue(mockEmployee);

      const result = await employeeService.fetchEmployeeDetails(1);

      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.getEmployeeDetails).toHaveBeenCalledWith(1);
    });
  });

  describe('fetchSubmittedQuestions', () => {
    it('should return submitted questions with pagination', async () => {
      const mockQuestions = [
        { id: 1, question: 'What is JavaScript?' },
        { id: 2, question: 'Explain closures.' },
      ];
      employeeRepository.getSubmittedQuestions.mockResolvedValue(mockQuestions);

      const result = await employeeService.fetchSubmittedQuestions(1, 1, 10);

      expect(result).toEqual(mockQuestions);
      expect(employeeRepository.getSubmittedQuestions).toHaveBeenCalledWith(1, 1, 10);
    });
  });
});