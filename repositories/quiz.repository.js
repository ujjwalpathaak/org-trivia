import { ObjectId } from 'mongodb';

import Quiz from '../models/quiz.model.js';

const findLiveQuizByOrgId = (orgId) => {
  return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
};

const isWeeklyQuizCancelled = (orgId) => {
  return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'cancelled' });
};

const doesWeeklyQuizExist = (orgId, dateNextFriday) => {
  return Quiz.findOne({
    orgId: new ObjectId(orgId),
    scheduledDate: dateNextFriday,
    status: { $ne: 'expired' },
  });
};

const scheduleNewWeeklyQuiz = (orgId, dateNextFriday, genre) => {
  return Quiz.create({
    orgId,
    status: 'upcoming',
    scheduledDate: dateNextFriday,
    genre,
  });
};

const makeWeeklyQuizLive = (today) => {
  return Quiz.updateMany(
    { scheduledDate: today, status: 'approved' },
    { $set: { status: 'live' } },
  );
};

const makeQuizLiveTest = () => {
  return Promise.all([
    Quiz.updateMany(
      { status: { $in: ['unapproved', 'upcoming'] } },
      { $set: { status: 'cancelled' } },
    ),
    Quiz.updateMany({ status: 'approved' }, { $set: { status: 'live' } }),
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
  isWeeklyQuizCancelled,
  doesWeeklyQuizExist,
  scheduleNewWeeklyQuiz,
  makeWeeklyQuizLive,
  makeQuizLiveTest,
  markAllQuizAsExpired,
  updateQuizStatusToApproved,
  getUpcomingWeeklyQuiz,
  updateQuizStatus,
  getLiveQuizByEmployeeId,
};
