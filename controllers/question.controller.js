import { response } from 'express';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);

class QuestionController {
  async addQuestions(req, res, next) {
    try {
      const question = req.body;

      const response = await questionService.saveQuestion(question);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async handleLambdaCallback(req, res, next) {
    try {
      const data = req.body;

      const weeklyQuestions = await questionService.formatWeeklyQuestions(data);

      await questionService.saveWeeklyQuestions(weeklyQuestions);

      res.status(200).json({ message: 'Scheduled new questions' });
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
}

export default QuestionController;
