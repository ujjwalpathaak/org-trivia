import AnswerRepository from '../repositories/answer.repository.js';
import AnswerService from '../services/answer.service.js';

const answerRepository = new AnswerRepository();
const answerService = new AnswerService(answerRepository);

class AnswerController {
  async handleSubmitWeeklyQuizAnswers(req, res, next) {
    try {
      const { answers, employeeId, orgId, quizId } = req.body;
      const response = await answerService.submitWeeklyQuizAnswers(
        answers,
        employeeId,
        orgId,
        quizId
      );

      res.status(response.status).json(response.data);
    } catch (err) {
      next(err);
    }
  }
}

export default AnswerController;
