import EmployeeRepository from '../repositories/employee.repository.js';
import LeaderboardRepository from '../repositories/leaderboard.respository.js';
import QuizRepository from '../repositories/quiz.repository.js';
import ResultRepository from '../repositories/result.repository.js';
import ResultService from '../services/result.service.js';

const resultService = new ResultService(
  new ResultRepository(),
  new EmployeeRepository(),
  new QuizRepository(),
  new LeaderboardRepository(),
);

class ResultController {
  async submitWeeklyQuizAnswers(req, res, next) {
    try {
      const { answers, employeeId, orgId, quizId } = req.body;
      if (!answers || !employeeId || !orgId || !quizId) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const data = await resultService.submitWeeklyQuizAnswers(
        answers,
        employeeId,
        orgId,
        quizId,
      );

      if(!data.success) res.status(400).json({
        message: data.message,
        data: null
      })

      res
        .status(200)
        .json({ message: 'Submitted weekly quiz answers', data: data });
    } catch (err) {
      next(err);
    }
  }

  async getEmployeePastResults(req, res, next) {
    try {
      const { employeeId } = req.params;
      const { page = 0, size = 10 } = req.query;
      if (!employeeId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const pastRecords =
        await resultService.getEmployeePastResults(employeeId, page, size);

      res.status(200).json(pastRecords);
    } catch (err) {
      next(err);
    }
  }
}

export default ResultController;
