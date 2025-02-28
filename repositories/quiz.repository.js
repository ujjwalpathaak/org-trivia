import Quiz from "../models/quiz.model.js";
import WeeklyQuestion from "../models/weeklyQuestion.model.js";

import ObjectId from 'mongodb'

class QuizRepository {
    async weeklyQuizQuestions(orgId) {
        const questions = await WeeklyQuestion.find({ org: orgId })
          .select({ 'question.answer': 0 })
          .lean();
        return questions.map((curr) => {
          return curr.question;
        });
      }

      async scheduleNewQuiz(orgId, date) {
        const existingQuiz = await Quiz.findOne({ orgId, scheduledDate });

        if (existingQuiz) {
          return { status: 500, data: "Cannot schedule new quiz" };
        }

        return await Quiz.insertOne({
          orgId: orgId,
          scheduledDate: date
        })
      }
}

export default QuizRepository;
