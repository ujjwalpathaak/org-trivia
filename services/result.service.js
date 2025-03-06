import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from './question.service.js';

const questionService = new QuestionService(new QuestionRepository());

class ResultService {
  constructor(resultRepository, employeeRepository) {
    this.resultRepository = resultRepository;
    this.employeeRepository = employeeRepository;
  }

  async calculateWeeklyQuizScore(userAnswers, correctAnswers) {
    let weeklyQuizScore = 0;

    userAnswers.forEach(({ questionId, result }) => {
      const correctAnswer = correctAnswers.find(
        (correctAnswer) => correctAnswer._id.toString() === questionId,
      );

      if (correctAnswer && result === correctAnswer.result) {
        weeklyQuizScore += 10;
      }
    });

    return weeklyQuizScore;
  }

  async submitWeeklyQuizAnswers(userAnswers, employeeId, orgId, quizId) {
    const correctAnswers = await questionService.getWeeklyQuizCorrectAnswers(
      orgId,
      quizId,
    );

    const userAnswersJSON = JSON.parse(userAnswers);
    const weeklyQuizScore = await this.calculateWeeklyQuizScore(
      userAnswersJSON,
      correctAnswers,
    );

    await this.resultRepository.submitWeeklyQuizAnswers();
    await this.employeeRepository.updateWeeklyQuizScore(
      employeeId,
      weeklyQuizScore,
    );

    return;
  }
}

export default ResultService;
