import { getMonthAndYear, mergeAnswers } from '../client/src/utils.js';
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

  async getEmployeePastRecords(employeeId) {
    return await this.resultRepository.getEmployeePastRecords(employeeId);
  }

  async submitWeeklyQuizAnswers(userAnswers, employeeId, orgId, quizId) {
    const correctAnswers = await questionService.getWeeklyQuizCorrectAnswers(
      orgId,
      quizId,
    );
    const quiz = await this.quizRepository.findLiveQuizByOrgId(orgId);
    const userAnswersJSON = JSON.parse(userAnswers);
    const weeklyQuizScore = await this.calculateWeeklyQuizScore(
      userAnswersJSON,
      correctAnswers,
    );
    const [month, year] = getMonthAndYear();

    await this.employeeRepository.updateWeeklyQuizScore(
      employeeId,
      weeklyQuizScore,
    );

    await this.leaderboardRespository.updateLeaderboard(
      orgId,
      employeeId,
      weeklyQuizScore,
      month,
      year,
    );

    const answers = mergeAnswers(correctAnswers, userAnswersJSON)

    await this.resultRepository.submitWeeklyQuizAnswers(
      employeeId,
      orgId,
      quizId,
      weeklyQuizScore,
      quiz.scheduledDate,
      quiz.genre,
      answers,
    );

    return true;
  }

  async fetchEmployeeScore(employeeId) {
    console.log(employeeId);
    const quiz = await this.quizRepository.getLiveQuizByEmployeeId(employeeId);
    console.log(quiz);
    return await this.resultRepository.getEmployeeScore(employeeId, quiz);
  }
}

export default ResultService;
