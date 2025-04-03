import { ObjectId } from 'mongodb';

import Quiz from '../models/quiz.model.js';
import { findResultByQuizId } from './result.repository.js';

export const findLiveQuizByOrgId = (orgId) => {
  return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
};

export const findQuiz = (quizId) => {
  return Quiz.findOne({ _id: new ObjectId(quizId) });
};

export const getQuizStatus = (orgId) => {
  return Quiz.findOne(
    {
      orgId: new ObjectId(orgId),
      $or: [{ status: 'live' }, { status: 'cancelled' }],
    },
    { status: 1, _id: 0 },
  );
};

// export const lastQuizByGenre = (orgId, genre) => {
//   return Quiz.findOne(
//     { orgId: new ObjectId(orgId), genre: genre },
//     { sort: { scheduledDate: -1 } },
//     { limit: 1 },
//   );
// };

export const cancelLiveQuiz = async (quizId) => {
  await findResultByQuizId(quizId);
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'live' },
    { $set: { status: 'cancelled' } },
  );
};

export const getScheduledQuizzes = (orgId) => {
  return Quiz.find({
    orgId: new ObjectId(orgId),
    status: { $in: ['upcoming', 'scheduled'] },
  }).sort({
    scheduledDate: 1,
  });
};

export const scheduleNewWeeklyQuiz = (orgId, date, genre) => {
  return Quiz.create({
    orgId,
    status: 'upcoming',
    scheduledDate: date,
    genre,
  });
};

export const makeWeeklyQuizLive = () => {
  return Quiz.bulkWrite([
    {
      updateMany: {
        filter: { status: { $in: ['upcoming'] } },
        update: { $set: { status: 'cancelled' } },
      },
    },
    {
      updateMany: {
        filter: { status: 'scheduled' },
        update: { $set: { status: 'live' } },
      },
    },
  ]);
};

export const markAllQuizAsExpired = () => {
  return Quiz.updateMany({}, { $set: { status: 'expired' } });
};

// export const updateQuizStatusToApproved = (quizId) => {
//   return Quiz.updateMany(
//     { _id: new ObjectId(quizId) },
//     { $set: { status: 'approved' } },
//   );
// };

export const getUpcomingWeeklyQuiz = (orgId) => {
  return Quiz.findOne({
    orgId: new ObjectId(orgId),
    status: 'unapproved',
  });
};

export const updateQuizStatus = (quizId, status) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId) },
    {
      $set: {
        status: status,
      },
    },
  );
};

export const getLiveQuizByEmployeeId = async (employeeId) => {
  const result = await findResultByQuizId(employeeId);
  return result?.quizId;
};

export const changeQuizGenre = async (newGenre, quizId) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'upcoming' },
    { $set: { genre: newGenre } },
  );
};
