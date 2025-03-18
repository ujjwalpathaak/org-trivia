import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../middleware/utils.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from './question.service.js';

const questionService = new QuestionService(new QuestionRepository());

class ResultService {
  constructor(
    resultRepository,
    employeeRepository,
    quizRepository,
    leaderboardRespository,
  ) {
    this.resultRepository = resultRepository;
    this.employeeRepository = employeeRepository;
    this.quizRepository = quizRepository;
    this.leaderboardRespository = leaderboardRespository;
  }

  async calculateWeeklyQuizScore(userAnswers, correctAnswers) {
    let weeklyQuizScore = 0;

    userAnswers.forEach(({ questionId, answer }) => {
      const correctAnswer = correctAnswers.find(
        (correctAnswer) => correctAnswer._id.toString() === questionId,
      );

      if (correctAnswer && answer === correctAnswer.answer) {
        weeklyQuizScore += 10;
      }
    });

    return weeklyQuizScore;
  }

  async getEmployeePastResults(employeeId, page, size) {
    return await this.resultRepository.getEmployeePastResults(
      employeeId,
      page,
      size,
    );
  }

  async submitWeeklyQuizAnswers(userAnswers, employeeId, orgId, quizId) {
    const correctAnswers = await questionService.getWeeklyQuizCorrectAnswers(
      orgId,
      quizId,
    );
    const points = await this.calculateWeeklyQuizScore(
      userAnswers,
      correctAnswers,
    );

    const data = await this.employeeRepository.updateWeeklyQuizScore(
      employeeId,
      points,
    );

    if (!data)
      return {
        success: false,
        message: 'Error updating employee score - quiz already given',
      };

    const [month, year] = getMonthAndYear();

    await this.leaderboardRespository.updateLeaderboard(
      orgId,
      employeeId,
      data.score,
      month,
      year,
    );

    const mergedUserAnswersAndCorrectAnswers =
      mergeUserAnswersAndCorrectAnswers(correctAnswers, userAnswers);

    const quiz = await this.quizRepository.findLiveQuizByOrgId(orgId);

    await this.resultRepository.submitWeeklyQuizAnswers(
      employeeId,
      orgId,
      quizId,
      data.multiplier,
      data.score,
      points,
      quiz.genre,
      mergedUserAnswersAndCorrectAnswers,
    );

    return {
      success: true,
      multiplier: data.multiplier,
      score: data.score,
      points: points,
    };
  }

  async fetchEmployeeScore(employeeId) {
    const quiz = await this.quizRepository.getLiveQuizByEmployeeId(employeeId);
    return await this.resultRepository.getEmployeeScore(employeeId, quiz);
  }
}

export default ResultService;
