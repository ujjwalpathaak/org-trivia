import QuizService from '../services/quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const quizRepository = new QuizRepository();
const quizService = new QuizService(quizRepository);

const questionService = new QuestionService(new QuestionRepository())

class QuizController {
    async handleLambdaCallback(req, res, next) {
        try {
          const data = req.body;
    
          const weeklyQuestions = await quizService.formatWeeklyQuestions(data);
    
          await questionService.saveWeeklyQuizQuestions(weeklyQuestions);
    
          res.status(200).json({ message: 'Scheduled new questions' });
        } catch (error) {
          next(error);
        }
      }

      async scheduleNewQuiz(req, res, next) {
        try {
          const { orgId } = req.params;
    
          const response = await quizService.scheduleNewQuiz(orgId);
    
          res.status(response.status).json(response.data);
        } catch (error) {
          next(error);
        }
      }

      async getWeeklyQuizQuestions(req, res, next) {
        try {
          const { orgId } = req.params;
    
          const response = await quizService.getWeeklyQuizQuestions(orgId);
    
          res.status(response.status).json(response.data);
        } catch (error) {
          next(error);
        }
      }
    
}

export default QuizController;
