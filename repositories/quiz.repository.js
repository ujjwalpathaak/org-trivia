import Employee from '../models/employee.model.js';
import Org from '../models/org.model.js';
import Quiz from '../models/quiz.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import { ObjectId } from 'mongodb';

class QuizRepository {
  async findLiveQuizByOrgId(orgId){
    return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
  }

  async doesWeeklyQuizExist(orgId, dateNextFriday) {
    return Quiz.findOne({ orgId: new ObjectId(orgId), scheduledDate: dateNextFriday, status: { $ne: 'expired' } });
  }

  async scheduleNewWeeklyQuiz(orgId, dateNextFriday, genre) {
    return Quiz.create({
      orgId,
      status: 'upcoming',
      scheduledDate: dateNextFriday,
      genre,
    });
  }

  async makeWeeklyQuizLive(today) {
    return Quiz.updateMany(
      { scheduledDate: today, status: 'approved' },
      { $set: { status: 'live' } },
    );
  }

  async makeQuizLiveTest() {
    return Quiz.updateMany({ status: 'approved' }, { $set: { status: 'live' } });
  }

  // move to ques repo
  async getApprovedWeeklyQuizQuestion(orgId){
    return WeeklyQuestion.find({
      orgId: new ObjectId(orgId),
      isApproved: true,
    })
    .select({ 'question.answer': 0 })
    .lean();
  }
  // move to ques repo
  async dropWeeklyQuizCollection(){
    return WeeklyQuestion.deleteMany({});
  }

  async markAllQuizAsExpired() {
    return Quiz.updateMany({}, { $set: { status: 'expired' } });
  }

  // ----------------------------------------------------------------

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
}

export default QuizRepository;
