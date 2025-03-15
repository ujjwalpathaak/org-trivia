import { getNextFridayDate, getTodayDate } from '../middleware/utils.js';

import { ObjectId } from 'mongodb';

class QuizService {
  constructor(quizRepository, employeeRepository, questionRepository, orgRepository) {
    this.quizRepository = quizRepository;
    this.employeeRepository = employeeRepository;
    this.questionRepository = questionRepository;
    this.orgRepository = orgRepository;
  }

  async isWeeklyQuizLiveAndNotGiven(orgId, employeeId) {
    const [isWeeklyQuizLive, employee] = await Promise.all([
      this.quizRepository.findLiveQuizByOrgId(orgId),
      this.employeeRepository.isWeeklyQuizGiven(employeeId),
    ]);

    if (isWeeklyQuizLive && !employee.quizGiven) return true;

    return false;
  }

  async scheduleNewWeeklyQuiz(orgId, genre) {
    const dateNextFriday = getNextFridayDate();

    const existingWeeklyQuiz = await this.quizRepository.doesWeeklyQuizExist(
      orgId,
      dateNextFriday,
    );

    if (existingWeeklyQuiz) {
      return false;
    }

    const newWeeklyQuiz = await this.quizRepository.scheduleNewWeeklyQuiz(
      orgId,
      dateNextFriday,
      genre,
    );

    if (!newWeeklyQuiz) return false;

    return { message: 'New Quiz Scheduled' };
  }

  async makeWeeklyQuizLive() {
    const today = getTodayDate();

    await this.quizRepository.makeWeeklyQuizLive(today);

    return { message: 'All weekly quiz are live' };
  }

  async makeQuizLiveTest() {
    await this.quizRepository.makeQuizLiveTest();

    return { message: 'All weekly quiz are live' };
  }

  async getUpcomingWeeklyQuizByOrgId(orgId) {
    return this.questionRepository.getUpcomingWeeklyQuiz(orgId);
  }

  async cleanUpWeeklyQuiz() {
    await Promise.all([
      this.quizRepository.markAllQuizAsExpired(),
      this.employeeRepository.updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven(),
      this.questionRepository.dropWeeklyQuestionCollection(),
    ]);

    return {
      message: 'Cleaned up weekly quiz.',
    };
  }
}

export default QuizService;
