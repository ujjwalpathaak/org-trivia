import Quiz from '../models/quiz.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';

import { ObjectId } from 'mongodb';

class QuizRepository {
  async findLiveQuizByOrgId(orgId) {
    return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
  }

  async getLiveQuizByEmployeeId(employeeId) {
    return Quiz.findOne({
      employeeId: new ObjectId(employeeId),
      status: 'live',
    });
  }

  async doesWeeklyQuizExist(orgId, dateNextFriday) {
    return Quiz.findOne({
      orgId: new ObjectId(orgId),
      scheduledDate: dateNextFriday,
      status: { $ne: 'expired' },
    });
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
    return Quiz.updateMany(
      { status: 'approved' },
      { $set: { status: 'live' } },
    );
  }

  // move to ques repo
  async getApprovedWeeklyQuizQuestion(orgId) {
    return WeeklyQuestion.find({
      orgId: new ObjectId(orgId),
      isApproved: true,
    })
      .select({ 'question.answer': 0 })
      .lean();
  }
  // move to ques repo
  async dropWeeklyQuizCollection() {
    return WeeklyQuestion.deleteMany({});
  }

  // move to ques repo
  async updateWeeklyQuestionsStatusToApproved(idsOfQuestionsToApprove) {
    return WeeklyQuestion.updateMany(
      { 'question._id': { $in: idsOfQuestionsToApprove } },
      { $set: { isApproved: true } },
    );
  }

  async markAllQuizAsExpired() {
    return Quiz.updateMany({}, { $set: { status: 'expired' } });
  }

  async updateQuizStatusToApproved(quizId) {
    return Quiz.updateMany(
      { _id: new ObjectId(quizId) },
      { $set: { status: 'approved' } },
    );
  }
}

export default QuizRepository;
