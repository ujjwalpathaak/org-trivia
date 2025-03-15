import Quiz from '../models/quiz.model.js';

import { ObjectId } from 'mongodb';

class QuizRepository {
  async findLiveQuizByOrgId(orgId) {
    return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
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

  async markAllQuizAsExpired() {
    return Quiz.updateMany({}, { $set: { status: 'expired' } });
  }

  async updateQuizStatusToApproved(quizId) {
    return Quiz.updateMany(
      { _id: new ObjectId(quizId) },
      { $set: { status: 'approved' } },
    );
  }

  async getUpcomingWeeklyQuiz(orgId) {
    return Quiz.findOne({
      orgId: new ObjectId(orgId),
      status: 'unapproved',
    });
  }

  async updateQuizStatus(quizId, status) {
    return Quiz.updateOne(
      { _id: new ObjectId(quizId) },
      {
        $set: {
          status: status,
        },
      },
    );
  }

  async getLiveQuizByEmployeeId(employeeId) {
    return Quiz.findOne({
      employeeId: new ObjectId(employeeId),
      status: 'live',
    });
  }
}

export default QuizRepository;
