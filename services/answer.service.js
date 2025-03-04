import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from './question.service.js';

const questionService = new QuestionService(new QuestionRepository());

class AnswerService {
  constructor(answerRepository) {
    this.answerRepository = answerRepository;
  }

  async submitWeeklyQuizAnswers(userAnswers, employeeId, orgId, quizId) {
    const correctAnswers = await questionService.getWeeklyQuizCorrectAnswers(
      orgId,
      quizId,
    );

    await this.answerRepository.submitWeeklyQuizAnswers(
      userAnswers,
      correctAnswers,
      employeeId,
      orgId,
      quizId,
    );

    return;
  }
}

export default AnswerService;
