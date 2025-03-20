import EmployeeRepository from '../repositories/employee.repository.js';
import EmployeeService from '../services/employee.service.js';

const employeeService = new EmployeeService(new EmployeeRepository());

class EmployeeController {
  async getEmployeeDetails(req, res, next) {
    try {
      const { employeeId } = req.params;
      if (!employeeId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const employeeDetails =
        await employeeService.getEmployeeDetails(employeeId);

      res.status(200).json(employeeDetails);
    } catch (error) {
      next(error);
    }
  }

  async fetchEmployeeScore(req, res, next) {
    try {
      const { employeeId } = req.params;
      if (!employeeId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const employeeScore =
        await employeeService.fetchEmployeeScore(employeeId);

      res.status(200).json(employeeScore);
    } catch (error) {
      next(error);
    }
  }

  async getPastQuizResults(req, res, next) {
    try {
      const { employeeId } = req.params;
      const pastQuizResults =
        await employeeService.getPastQuizResults(employeeId);

      res.status(200).json(pastQuizResults);
    } catch (error) {
      next(error);
    }
  }

  async getSubmittedQuestions(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { page = 0, size = 10 } = req.query;
      const pastQuizResults = await employeeService.getSubmittedQuestions(
        employeeId,
        page,
        size,
      );

      res.status(200).json(pastQuizResults);
    } catch (error) {
      next(error);
    }
  }
}

export default EmployeeController;
