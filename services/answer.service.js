import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from './question.service.js';

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);

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
      quizId
    );

    return response;
  }
}

export default AnswerService;
