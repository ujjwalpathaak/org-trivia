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

  async scheduleNewQuiz(orgId, genre) {
    const dateNextFriday = getNextFriday();

    const response = await this.quizRepository.scheduleNewQuiz(
      orgId,
      dateNextFriday,
      genre
    );
    if (response.status === 500) return response.status

    return response;
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
