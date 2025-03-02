import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionService = new QuestionService(new QuestionRepository());

class QuestionController {
  async addQuestion(req, res, next) {
    try {
      const question = req.body;
      if (!question.question || !question.type || !question.options) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const response = await questionService.saveQuestion(question);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyUnapprovedQuestions(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

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
      if (!orgId || !questions) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const response = await questionService.saveHRdocQuestions(
        orgId,
        questions,
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async testScheduleNextWeekQuestionsApproval(req, res, next) {
    try {
      await questionService.scheduleNextWeekQuestionsApproval();

      res.json('Job running');
    } catch (error) {
      next(error);
    }
  }
}

export default QuestionController;
