import { getNextFridayDate } from '../middleware/utils.js';

class QuizService {
  constructor(quizRepository, employeeRepository) {
    this.quizRepository = quizRepository;
    this.employeeRepository = employeeRepository;
  }

  async isWeeklyQuizLive(orgId, employeeId) {
    const [isWeeklyQuizLive, employee] = await Promise.all([
      this.quizRepository.findLiveQuizByOrgId(orgId),
      this.employeeRepository.didEmployeeGaveWeeklyQuiz(employeeId),
    ]);

    if (isWeeklyQuizLive && !employee.isQuizGiven) return true;

    return false;
  }

  async scheduleNewWeeklyQuiz(orgId, genre) {
    const dateNextFriday = getNextFridayDate();

    const existingWeeklyQuiz = await this.quizRepository.doesWeeklyQuizExist(orgId, dateNextFriday);

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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await this.quizRepository.makeWeeklyQuizLive(today);

    return { message: 'All weekly quiz are live' }
  }

  async makeQuizLiveTest() {
    await this.quizRepository.makeQuizLiveTest();

    return { message: 'All weekly quiz are live' }
  }
  // move to ques service
  async getWeeklyQuizQuestions(orgId) {
    const approvedWeeklyQuizQuestion =
      await this.quizRepository.getApprovedWeeklyQuizQuestion(orgId);

    const quizQuestions = approvedWeeklyQuizQuestion.map((ques) => {
      return ques.question;
    });

    return {
      weeklyQuizQuestions: quizQuestions || [],
      quizId: approvedWeeklyQuizQuestion[0]?.quizId || null,
    };
  }

  async cleanUpWeeklyQuiz() {
    await Promise.all([
      this.quizRepository.markAllQuizAsExpired(),
      this.employeeRepository.markAllEmployeesAsQuizNotGiven(),
      this.quizRepository.dropWeeklyQuizCollection(),

    ]);

    return {
      message:
        'Cleaned up weekly quiz.',
    };
  }
  
  // ----------------------------------------------------------------

  async formatQuestionsWeeklyFormat(questions, orgId, quizId) {
    const dateNextFriday = getNextFridayDate();

    const formatedWeeklyQuestions = questions.map((curr) => ({
      scheduledDate: dateNextFriday,
      quizId: quizId,
      question: curr,
      orgId: orgId,
    }));

    return formatedWeeklyQuestions;
  }

  async formatQuestions(questions, orgId, category) {
    const weeklyQuestions = questions.map((curr) => ({
      ...curr,
      source: 'AI',
      category: category,
      status: 'live',
      org: orgId,
    }));

    return weeklyQuestions;
  }

  async approveWeeklyQuizQuestions(questions, orgId) {
    await this.quizRepository.approveWeeklyQuizQuestions(questions, orgId);
  }
}

export default QuizService;
