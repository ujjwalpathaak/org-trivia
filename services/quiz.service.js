class QuizService {
  constructor(quizRepository) {
    this.quizRepository = quizRepository;
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
