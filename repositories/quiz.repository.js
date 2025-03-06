import Employee from '../models/employee.model.js';
import Org from '../models/org.model.js';
import Quiz from '../models/quiz.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import { ObjectId } from 'mongodb';

class QuizRepository {
  async findLiveQuizByOrgId(orgId){
    return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
  }

  // ----------------------------------------------------------------

  async isWeeklyQuizLive(orgId, employeeId) {
    const [isWeeklyQuizLive, employee] = await Promise.all([
      Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' }),
      Employee.findOne({ _id: new ObjectId(employeeId) }),
    ]);

    const isQuizGiven = employee?.get('isQuizGiven');
    // console.log()
    if (isWeeklyQuizLive && !isQuizGiven) return true;

    return false;
  }

  async scheduleNewQuiz(orgId, date, genre) {
    const newDate = new Date(date);
    newDate.setUTCHours(0, 0, 0, 0);

    const existingWeeklyQuiz = await Quiz.findOne({
      orgId,
      scheduledDate: newDate,
      status: { $ne: 'expired' },
    });

    if (existingWeeklyQuiz) {
      return false;
    }

    const newWeeklyQuiz = await Quiz.create({
      orgId,
      status: 'upcoming',
      scheduledDate: newDate,
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
      (question) => new ObjectId(question.question._id),
    );
    const category = questions[0].question.category;
    const quizId = questions[0].quizId;

    console.log("category, quizId, orgId", category, quizId, orgId)
    console.log(idsOfQuestionsToApprove)

    if (category === 'PnA') {
      await Org.updateMany(
        { _id: new ObjectId(orgId) },
        {
          $set: { 'questionsPnA.$[elem].isUsed': true },
        },
        {
          arrayFilters: [
            {
              'elem.questionId': {
                $in: idsOfQuestionsToApprove,
              },
            },
          ],
        },
      );
    }
    else if(category === 'CAnIT'){
      const temp = await Org.updateMany(
        { _id: new ObjectId(orgId) },
        {
          $set: { 'questionsCAnIT.$[elem].isUsed': true },
        },
        {
          arrayFilters: [
            {
              'elem.questionId': {
                $in: idsOfQuestionsToApprove,
              },
            },
          ],
        },
      );
      console.log(temp)
    }
    else if(category === 'HRD'){
      const temp = await Org.updateMany(
        { _id: new ObjectId(orgId) },
        {
          $set: { 'questionsHRD.$[elem].isUsed': true },
        },
        {
          arrayFilters: [
            {
              'elem.questionId': {
                $in: idsOfQuestionsToApprove,
              },
            },
          ],
        },
      );
      console.log(temp)
    }

    const updatedQuiz = await Quiz.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: { status: 'approved' } },
    );
    const updatedWeeklyQuestion = await WeeklyQuestion.updateMany(
      { 'question._id': { $in: idsOfQuestionsToApprove } },
      { $set: { isApproved: true } },
    );
    console.log(updatedWeeklyQuestion)
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

    await Quiz.updateMany(
      {},
      {
        $set: { status: 'expired' },
      },
    );

    // await Question.updateMany(
    //   { _id: { $in: idsOfQuestionsToClean } },
    //   { $set: { 'question.status': 'done' } },
    // );

    await WeeklyQuestion.deleteMany({});
  }
}

export default QuizRepository;
