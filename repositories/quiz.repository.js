import { ObjectId } from 'mongodb';

import { getNextFridayDate } from '../middleware/utils.js';
import Quiz from '../models/quiz.model.js';
import resultRepository from './result.repository.js';

const findLiveQuizByOrgId = (orgId) => {
  return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
};

const getQuizStatus = (orgId) => {
  return Quiz.findOne(
    {
      orgId: new ObjectId(orgId),
      $or: [{ status: 'live' }, { status: 'cancelled' }],
    },
    { status: 1, _id: 0 },
  );
};

const cancelLiveQuiz = async (quizId) => {
  await resultRepository.rollbackWeeklyQuizScores(quizId);
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'live' },
    { $set: { status: 'cancelled' } },
  );
};

const scheduleNewWeeklyQuiz = (orgId, genre) => {
  const dateNextFriday = getNextFridayDate();
  return Quiz.create({
    orgId,
    status: 'upcoming',
    scheduledDate: dateNextFriday,
    genre,
  });
};

const makeWeeklyQuizLive = () => {
  return Quiz.bulkWrite([
    {
      updateMany: {
        filter: { status: { $in: ['unapproved', 'upcoming'] } },
        update: { $set: { status: 'cancelled' } },
      },
    },
    {
      updateMany: {
        filter: { status: 'approved' },
        update: { $set: { status: 'live' } },
      },
    },
  ]);
};

const markAllQuizAsExpired = () => {
  return Quiz.updateMany({}, { $set: { status: 'expired' } });
};

const updateQuizStatusToApproved = (quizId) => {
  return Quiz.updateMany(
    { _id: new ObjectId(quizId) },
    { $set: { status: 'approved' } },
  );
};

const getUpcomingWeeklyQuiz = (orgId) => {
  return Quiz.findOne({
    orgId: new ObjectId(orgId),
    status: 'unapproved',
  });
};

const updateQuizStatus = (quizId, status) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId) },
    {
      $set: {
        status: status,
      },
    },
  );
};

const getLiveQuizByEmployeeId = (employeeId) => {
  return Quiz.findOne({
    employeeId: new ObjectId(employeeId),
    status: 'live',
  });
};

export default {
  findLiveQuizByOrgId,
  scheduleNewWeeklyQuiz,
  getQuizStatus,
  makeWeeklyQuizLive,
  cancelLiveQuiz,
  markAllQuizAsExpired,
  updateQuizStatusToApproved,
  getUpcomingWeeklyQuiz,
  updateQuizStatus,
  getLiveQuizByEmployeeId,
};
