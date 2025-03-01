import QuizService from '../services/quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const quizService = new QuizService(new QuizRepository());
const questionService = new QuestionService(new QuestionRepository());

class QuizController {
  async handleLambdaCallback(req, res, next) {
    try {
      const { questions, orgId, category } = req.body;
      if (!questions || !orgId || !category) {
        next(new Error('Invalid request body'));
        return;
      }

      const weeklyQuestions = await quizService.formatWeeklyQuestions(
        questions,
        orgId,
        category,
      );

      await questionService.saveWeeklyQuizQuestions(weeklyQuestions);

      res.status(200).json({ message: 'Scheduled new questions' });
    } catch (error) {
      next(error);
    }
  }

  async scheduleNewQuiz(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const response = await quizService.scheduleNewQuiz(orgId);

      res.status(response.status).json(response.data);
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

      const response = await quizService.getWeeklyQuizQuestions(orgId);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default QuizController;
