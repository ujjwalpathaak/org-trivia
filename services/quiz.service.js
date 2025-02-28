import { getNextFriday } from "../middleware/utils.js";

class QuizService {
  constructor(quizRepository) {
    this.quizRepository = quizRepository;
  }

  async getWeeklyQuizQuestions(orgId) {
    const weeklyQuizQuestions =
      await this.quizRepository.weeklyQuizQuestions(orgId);
    return { status: 200, data: weeklyQuizQuestions };
  }

  async scheduleNewQuiz(orgId){
    const nextFriday = getNextFriday();
    const newQuiz = await this.quizRepository.scheduleNewQuiz(orgId, nextFriday);

    return {status: 201, data: newQuiz}
  }

    async formatWeeklyQuestions(data) {
      let { questions, orgId, category } = data;
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
