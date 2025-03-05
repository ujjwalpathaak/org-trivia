import Employee from '../models/employee.model.js';
import Org from '../models/org.model.js';
import Question from '../models/question.model.js';
import Quiz from '../models/quiz.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import { ObjectId } from 'mongodb';

class QuizRepository {
  async isWeeklyQuizLive(orgId, employeeId) {
    const [isWeeklyQuizLive, employee] = await Promise.all([
      Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' }),
      Employee.findOne({ _id: new ObjectId(employeeId) }),
    ]);

    const isQuizGiven = employee?.get('isQuizGiven');
    if (isWeeklyQuizLive && !isQuizGiven) return true;

    return false;
  }

  async getStartAndEndDates(date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
  }

  async scheduleNewQuiz(orgId, date, genre) {
    const { startOfDay, endOfDay } = await this.getStartAndEndDates(date);

    const existingWeeklyQuiz = await Quiz.findOne({
      orgId,
      scheduledDate: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingWeeklyQuiz) {
      return false;
    }

    const newWeeklyQuiz = await Quiz.create({
      orgId,
      status: 'upcoming',
      scheduledDate: startOfDay,
      genre,
    });

    return newWeeklyQuiz;
  }

  async makeWeeklyQuizLive() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await Quiz.updateMany(
      { scheduledDate: today, status: 'approved' },
      { $set: { status: 'live' } },
    );
  }
  async makeQuizLiveTest() {
    await Quiz.updateMany({ status: 'approved' }, { $set: { status: 'live' } });
  }

  async getWeeklyQuizQuestions(orgId) {
    const questions = await WeeklyQuestion.find({
      orgId: new ObjectId(orgId),
      isApproved: true,
    })
      .select({ 'question.answer': 0 })
      .lean();
    console.log(questions);
    const weeklyQuizQuestions = questions.map((curr) => {
      return curr.question;
    });
    return {
      weeklyQuizQuestions: weeklyQuizQuestions || [],
      quizId: questions[0]?.quizId || null,
    };
  }

  async approveWeeklyQuizQuestions(questions, orgId) {
    const idsOfQuestionsToApprove = questions.map(
      (question) => new ObjectId(question._id),
    );
    const category = questions[0].question.category;
    const quizId = questions[0].quizId;

    if (category === 'PnA') {
      await Org.updateMany(
        { _id: new ObjectId(orgId) },
        {
          $set: { 'questionsPnA.$[elem].isUsed': true },
        },
        {
          arrayFilters: [
            {
              'elem._id': {
                $in: idsOfQuestionsToApprove.map((id) => new ObjectId(id)),
              },
            },
          ],
        },
      );
    }

    await Quiz.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: { status: 'approved' } },
    );
    await WeeklyQuestion.updateMany(
      { _id: { $in: idsOfQuestionsToApprove } },
      { $set: { isApproved: true } },
    );
  }

  async cleanUpWeeklyQuiz() {
    await Promise.all([
      Quiz.updateMany({}, { $set: { status: 'expired' } }),
      Employee.updateMany({}, { $set: { isQuizGiven: false } }),
    ]);

    return {
      message:
        'Cleaned up weekly quiz questions and updated status of quiz, employee.',
    };
  }

  // ----------------------------------------------------------------

  async cleanWeeklyQuizQuestions() {
    const questionsToClean = await WeeklyQuestion.find({})
      .select('question._id')
      .lean();

    const idsOfQuestionsToClean = questionsToClean.map(
      (currentQuestion) => currentQuestion._id,
    );

    await Question.updateMany(
      { _id: { $in: idsOfQuestionsToClean } },
      { $set: { 'question.status': 'done' } },
    );

    await WeeklyQuestion.deleteMany({});
  }
}

export default QuizRepository;
