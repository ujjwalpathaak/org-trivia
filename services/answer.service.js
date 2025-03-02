import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from './question.service.js';

const questionService = new QuestionService(new QuestionRepository());

class AnswerService {
  constructor(answerRepository) {
    this.answerRepository = answerRepository;
  }

  async submitWeeklyQuizAnswers(userAnswers, employeeId, orgId, quizId) {
    const correctAnswers = await questionService.getWeeklyQuizAnswers(orgId);

    const response = await this.answerRepository.submitWeeklyQuizAnswers(
      userAnswers,
      correctAnswers,
      employeeId,
      orgId,
      quizId,
    );

    return { status: 200, data: response };
  }
}

export default AnswerService;
