import { getNextFridayDate, getTodayDate } from '../middleware/utils.js';

class QuizService {
  constructor(
    quizRepository,
    employeeRepository,
    questionRepository,
    orgRepository,
  ) {
    this.quizRepository = quizRepository;
    this.employeeRepository = employeeRepository;
    this.questionRepository = questionRepository;
    this.orgRepository = orgRepository;
  }

  async getWeeklyQuizStatus(orgId, employeeId) {
    const [isWeeklyQuizLive, isWeeklyQuizCancelled, employee] =
      await Promise.all([
        this.quizRepository.findLiveQuizByOrgId(orgId),
        this.quizRepository.isWeeklyQuizCancelled(orgId),
        this.employeeRepository.isWeeklyQuizGiven(employeeId),
      ]);

    if (isWeeklyQuizCancelled) {
      return {
        status: 'cancelled',
        state: 0,
        message: 'Weekly quiz has been cancelled',
      };
    } else if (isWeeklyQuizLive && !employee.quizGiven) {
      return {
        status: 'live',
        state: 1,
        message: 'Weekly quiz is live',
      };
    } else if (isWeeklyQuizLive && employee.quizGiven) {
      return {
        status: 'given',
        state: 2,
        message: 'Weekly quiz has been given',
      };
    } else {
      return {
        status: 'not live',
        state: 3,
        message: 'Weekly quiz is not live',
      };
    }
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

    return newWeeklyQuiz;
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
