import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);

class QuestionController {
  async addQuestion(req, res, next) {
    try {
      const question = req.body;

      const response = await questionService.saveQuestion(question);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyUnapprovedQuestions(req, res, next) {
    try {
      const { orgId } = req.params;
      const response =
        await questionService.getWeeklyUnapprovedQuestions(orgId);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async saveHRdocQuestions(req, res, next) {
    try {
      const { orgId, questions } = req.body;
      const response = await questionService.saveHRdocQuestions(
        orgId,
        questions
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

}

export default QuestionController;
