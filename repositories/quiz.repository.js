import Question from '../models/question.model.js';
import Quiz from '../models/quiz.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import { ObjectId } from 'mongodb';

class QuizRepository {
  async getWeeklyQuizQuestions(orgId) {
    const questions = await WeeklyQuestion.find({
      orgId: new ObjectId(orgId),
      isApproved: true,
    })
      .select({ 'question.answer': 0 })
      .lean();
    const weeklyQuizQuestions = questions.map((curr) => {
      return curr.question;
    });
    return {
      weeklyQuizQuestions: weeklyQuizQuestions,
      quizId: questions[0].quizId,
    };
  }

  async approveQuizQuestions(questions, orgId) {
    const idsOfQuestionsToApprove = questions.map(
      (question) => new ObjectId(question._id),
    );

    await WeeklyQuestion.updateMany(
      { _id: { $in: idsOfQuestionsToApprove } },
      { $set: { isApproved: true } },
    );
  }

  async scheduleNewQuiz(orgId, date, genre) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

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

  async cleanWeeklyQuizQuestions() {
    const questionsToClean = await WeeklyQuestion.find({})
      .select('question._id')
      .lean();

    const idsOfQuestionsToClean = questionsToClean.map(
      (currentQuestion) => currentQuestion._id,
    );

    console.log(idsOfQuestionsToClean);

    await Question.updateMany(
      { _id: { $in: idsOfQuestionsToClean } },
      { $set: { 'question.status': 'done' } },
    );

    await WeeklyQuestion.deleteMany({});
  }
}

export default QuizRepository;
