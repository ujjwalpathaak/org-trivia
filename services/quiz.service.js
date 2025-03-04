import { getNextFriday } from '../middleware/utils.js';

class QuizService {
  constructor(quizRepository) {
    this.quizRepository = quizRepository;
  }

  async getNextWeeklyQuizDate(orgId){
    const nextWeeklyQuizDate = this.quizRepository.fetchNextWeeklyQuizDate(orgId)

    if (!nextWeeklyQuizDate) {
      return false;
    }

    return nextWeeklyQuizDate;
  }
// ----------------------------------------------------------------
  async getWeeklyQuizQuestions(orgId) {
    const weeklyQuizQuestions =
      await this.quizRepository.getWeeklyQuizQuestions(orgId);

    return { status: 200, data: weeklyQuizQuestions };
  }

  async scheduleNewQuiz(orgId, genre) {
    const dateNextFriday = getNextFriday();

    const response = await this.quizRepository.scheduleNewQuiz(
      orgId,
      dateNextFriday,
      genre,
    );

    return response;
  }

  async approveWeeklyQuizQuestions(questions, orgId) {
    await this.quizRepository.approveQuizQuestions(questions, orgId);
  }

  async formatWeeklyQuestions(questions, orgId, category, quizId) {
    const nextFriday = getNextFriday();

    const weeklyQuestions = questions.map((curr) => ({
      scheduledDate: nextFriday,
      quizId: quizId,
      question: {
        ...curr,
        source: 'AI',
        category: category,
        status: 'live',
        org: orgId,
      },
      org: orgId,
    }));

    return weeklyQuestions;
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

  async cleanWeeklyQuizQuestions(questions, orgId) {
    await this.quizRepository.cleanWeeklyQuizQuestions(questions, orgId);

    return { status: 200, message: 'Questions cleaned successfully' };
  }
}

export default QuizService;
