import EmployeeRepository from '../repositories/employee.repository.js';
import OrgRepository from '../repositories/org.repository.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuizRepository from '../repositories/quiz.repository.js';
import QuizService from '../services/quiz.service.js';

const quizService = new QuizService(
  new QuizRepository(),
  new EmployeeRepository(),
  new QuestionRepository(),
  new OrgRepository(),
);

class CronTestController {
  async makeQuizLiveTest(req, res, next) {
    try {
      await quizService.makeQuizLiveTest();

      res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }

  async cleanWeeklyQuiz(req, res, next) {
    try {
      await quizService.cleanUpWeeklyQuiz();

      res.status(200).json({ message: 'Weekly quiz cleaned successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default CronTestController;
