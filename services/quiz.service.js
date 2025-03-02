import { getNextFriday } from '../middleware/utils.js';

class QuizService {
  constructor(quizRepository) {
    this.quizRepository = quizRepository;
  }

  async getWeeklyQuizQuestions(orgId) {
    const weeklyQuizQuestions =
      await this.quizRepository.weeklyQuizQuestions(orgId);

    return { status: 200, data: weeklyQuizQuestions };
  }

  async scheduleNewQuiz(orgId) {
    const dateNextFriday = getNextFriday();

    const newQuiz = await this.quizRepository.scheduleNewQuiz(
      orgId,
      dateNextFriday,
    );
    if (!newQuiz) {
      return { status: 409, error: 'Quiz already scheduled for this date.' };
    }

    return { status: 500, data: 'Cannot schedule new quiz' };
  }

  async formatWeeklyQuestions(questions, orgId, category) {
    const nextFriday = getNextFriday();

    const weeklyQuestions = questions.map((curr) => ({
      scheduledDate: nextFriday,
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
}

export default QuizService;
