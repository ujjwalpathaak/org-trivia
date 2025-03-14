import QuizService from '../services/quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';
import EmployeeRepository from '../repositories/employee.repository.js';
import OrgRepository from '../repositories/org.repository.js';

const quizService = new QuizService(
  new QuizRepository(),
  new EmployeeRepository(),
  new OrgRepository(),
);
const questionService = new QuestionService(new QuestionRepository());

class QuizController {
  async isWeeklyQuizLive(req, res, next) {
    try {
      const { orgId, employeeId } = req.params;
      if (!orgId || !employeeId)
        return res.status(404).json({ message: 'Missing organizationId' });

      const isWeeklyQuizLive = await quizService.isWeeklyQuizLive(
        orgId,
        employeeId,
      );

      res.status(200).json(isWeeklyQuizLive);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyQuizQuestions(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const weeklyQuizQuestions =
        await quizService.getWeeklyQuizQuestions(orgId);

      res.status(200).json(weeklyQuizQuestions);
    } catch (error) {
      next(error);
    }
  }

  async approveWeeklyQuizQuestions(req, res, next) {
    try {
      const { orgId } = req.params;
      const questions = req.body;
      if (!orgId || !questions) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      await quizService.approveWeeklyQuizQuestions(questions, orgId);

      res.status(200).json({ message: 'Questions marked as approved' });
    } catch (error) {
      next(error);
    }
  }

  async handleLambdaCallback(req, res, next) {
    try {
      const { questions, orgId, category, quizId, file } = req.body;
      if (!questions || !orgId || !category) {
        next(new Error('Invalid request body'));
        return;
      }

      await questionService.addLambdaCallbackQuestions(
        questions,
        category,
        orgId,
        quizId,
        file,
      );

      res.status(200).json({ message: 'Scheduled new questions' });
    } catch (error) {
      next(error);
    }
  }
}

export default QuizController;
