import { getNextFridayDate } from '../middleware/utils.js';

import { ObjectId } from 'mongodb';

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
      this.employeeRepository.updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven(),
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
    const category = unapprovedQuestions[0].question.category || null;

    await this.orgRepository.updateQuestionsStatusInOrgToUsed(
      orgId,
      category,
      idsOfQuestionsToApprove,
    );
    await this.quizRepository.updateQuizStatusToApproved(quizId);
    await this.quizRepository.updateWeeklyQuestionsStatusToApproved(
      idsOfQuestionsToApprove,
    );

    return {
      message: 'Questions approved.',
    };
  }
}

export default QuizService;
