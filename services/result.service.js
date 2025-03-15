import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../client/src/utils.js';
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

  async getEmployeePastRecords(employeeId) {
    return await this.resultRepository.getEmployeePastRecords(employeeId);
  }

  async submitWeeklyQuizAnswers(userAnswers, employeeId, orgId, quizId) {
    const correctAnswers = await questionService.getWeeklyQuizCorrectAnswers(
      orgId,
      quizId,
    );

    const rawScore = await this.calculateWeeklyQuizScore(
      userAnswers,
      correctAnswers,
    );

    const data = await this.employeeRepository.updateWeeklyQuizScore(
      quizId,
      employeeId,
      rawScore,
    );

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
      rawScore,
      quiz.scheduledDate,
      quiz.genre,
      mergedUserAnswersAndCorrectAnswers,
    );

    return {
      multiplier: data.multiplier,
      score: data.score,
      rawScore: rawScore,
    };
  }

  async fetchEmployeeScore(employeeId) {
    const quiz = await this.quizRepository.getLiveQuizByEmployeeId(employeeId);
    return await this.resultRepository.getEmployeeScore(employeeId, quiz);
  }
}

export default ResultService;
