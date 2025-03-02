import AnswerRepository from '../repositories/answer.repository.js';
import AnswerService from '../services/answer.service.js';

const answerService = new AnswerService(new AnswerRepository());

class AnswerController {
  async handleSubmitWeeklyQuizAnswers(req, res, next) {
    try {
      const { answers, employeeId, orgId, quizId } = req.body;
      if (!answers || !employeeId || !orgId || !quizId) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const response = await answerService.submitWeeklyQuizAnswers(
        answers,
        employeeId,
        orgId,
        quizId,
      );

      res.status(response.status).json(response.data);
    } catch (err) {
      next(err);
    }
  }
}

export default AnswerController;
