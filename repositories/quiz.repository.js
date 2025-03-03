import Quiz from '../models/quiz.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import ObjectId from 'mongodb';

class QuizRepository {
  async weeklyQuizQuestions(orgId) {
    const questions = await WeeklyQuestion.find({ org: orgId })
      .select({ 'question.answer': 0 })
      .lean();
    return questions.map((curr) => {
      return curr.question;
    });
  }
  async scheduleNewQuiz(orgId, date, genre) {
    // Convert the input date to a Date object (Start of the Day)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Get the end of the day
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Find any quiz scheduled within the same day
    const existingQuiz = await Quiz.findOne({
      orgId,
      scheduledDate: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingQuiz) {
      return {
        status: 500,
        data: 'Cannot schedule new quiz. Quiz already exists!',
      };
    }

    const newQuiz = await Quiz.create({
      orgId,
      scheduledDate: startOfDay,
      genre,
    });

    return { status: 201, data: newQuiz };
  }
}

export default QuizRepository;
