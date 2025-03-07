import EmployeeRepository from '../repositories/employee.repository.js';
import ResultRepository from '../repositories/result.repository.js';
import ResultService from '../services/result.service.js';

const resultService = new ResultService(
  new ResultRepository(),
  new EmployeeRepository(),
);

class ResultController {
  async submitWeeklyQuizAnswers(req, res, next) {
    try {
      const { answers, employeeId, orgId, quizId } = req.body;
      if (!answers || !employeeId || !orgId || !quizId) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      await resultService.submitWeeklyQuizAnswers(
        answers,
        employeeId,
        orgId,
        quizId,
      );

      res.status(200).json({ message: 'Submitted weekly quiz answers' });
    } catch (err) {
      next(err);
    }
  }
}

export default ResultController;
