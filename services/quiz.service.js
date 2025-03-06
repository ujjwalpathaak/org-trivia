import { getNextFridayDate } from '../middleware/utils.js';

class QuizService {
  constructor(quizRepository, employeeRepository, orgRepository) {
    this.quizRepository = quizRepository;
    this.employeeRepository = employeeRepository;
    this.orgRepository = orgRepository;
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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await this.quizRepository.makeWeeklyQuizLive(today);

    return { message: 'All weekly quiz are live' };
  }

  async makeQuizLiveTest() {
    await this.quizRepository.makeQuizLiveTest();

    return { message: 'All weekly quiz are live' };
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
      message: 'Cleaned up weekly quiz.',
    };
  }

  async approveWeeklyQuizQuestions(unapprovedQuestions, orgId) {
    const idsOfQuestionsToApprove = unapprovedQuestions.map(
      (q) => new ObjectId(q.question._id),
    );
    const quizId = unapprovedQuestions[0].quizId || null;

    await this.orgRepository.updateQuestionsStatus(orgId);
    await this.quizRepository.updateQuizStatusToApproved(quizId);
    await this.quizRepository.updateWeeklyQuestionsStatusToApproved(
      idsOfQuestionsToApprove,
    );

    return {
      message: 'Questions approved.',
    };
  }

  // ----------------------------------------------------------------

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
}

export default QuizService;
