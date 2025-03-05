import { getNextFridayDate } from '../middleware/utils.js';

class QuizService {
  constructor(quizRepository) {
    this.quizRepository = quizRepository;
  }

  async isWeeklyQuizLive(orgId, employeeId) {
    const isWeeklyQuizLive = this.quizRepository.isWeeklyQuizLive(
      orgId,
      employeeId,
    );

    return isWeeklyQuizLive;
  }

  async scheduleNewQuiz(orgId, genre) {
    const dateNextFriday = getNextFridayDate();

    const newWeeklyQuiz = await this.quizRepository.scheduleNewQuiz(
      orgId,
      dateNextFriday,
      genre,
    );
    if (!newWeeklyQuiz) return false;

    return newWeeklyQuiz;
  }

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

  async makeWeeklyQuizLive() {
    this.quizRepository.makeWeeklyQuizLive();
  }
  async makeQuizLiveTest() {
    this.quizRepository.makeQuizLiveTest();
  }
  async getWeeklyQuizQuestions(orgId) {
    const weeklyQuizQuestions =
      await this.quizRepository.getWeeklyQuizQuestions(orgId);

    return weeklyQuizQuestions;
  }

  async approveWeeklyQuizQuestions(questions, orgId) {
    await this.quizRepository.approveWeeklyQuizQuestions(questions, orgId);
  }

  async cleanUpWeeklyQuiz() {
    this.quizRepository.cleanUpWeeklyQuiz();

    return;
  }
  // ----------------------------------------------------------------

  async cleanWeeklyQuizQuestions(questions, orgId) {
    await this.quizRepository.cleanWeeklyQuizQuestions(questions, orgId);

    return { status: 200, message: 'Questions cleaned successfully' };
  }
}

export default QuizService;
