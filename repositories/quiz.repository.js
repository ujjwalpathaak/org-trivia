import { ObjectId } from 'mongodb';

import Quiz from '../models/quiz.model.js';
import { findResultByQuizId } from './result.repository.js';

export const findLiveQuizByOrgId = (orgId) => {
  return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
};

export const findQuiz = (quizId) => {
  return Quiz.findOne({ _id: new ObjectId(quizId) });
};

export const getLiveQuizQuestionsByOrgId = (orgId) => {
  return Quiz.aggregate([
    {
      $match: {
        orgId: new ObjectId('67c6904cf8c3ce19ef544cac'),
        status: 'live',
      },
    },
    {
      $lookup: {
        from: 'weeklyquestions',
        localField: '_id',
        foreignField: 'quizId',
        as: 'questions',
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$questions',
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions',
        foreignField: '_id',
        as: 'question',
      },
    },
    {
      $unwind: {
        path: '$question',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        'question.quizId': '$quizId',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$question',
      },
    },
  ]);
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
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'live' },
    { $set: { status: 'cancelled' } },
  );
};

export const getScheduledQuizzes = (orgId, date = new Date()) => {
  const monthStart = new Date(date.getFullYear(), date.getMonth() - 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  const endDate = new Date(monthEnd);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return Quiz.find({
    orgId: new ObjectId(orgId),
    scheduledDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['upcoming', 'scheduled', 'live'] },
  }).sort({
    scheduledDate: 1,
  });
};

// export const getCAnITQuizzesScheduledTomm = (genre) => {
//   const tomorrow = new Date();
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   tomorrow.setHours(0, 0, 0, 0);

//   const dayAfterTomorrow = new Date(tomorrow);
//   dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

//   return Quiz.find({
//     genre: genre || "CAnIT",
//     status: "upcoming",
//     scheduledDate: {
//       $gte: tomorrow,
//       $lt: dayAfterTomorrow,
//     },
//   });
// };

export const lastQuizByGenre = () => {
  return Quiz.aggregate([
    {
      $match: { genre: 'CAnIT', status: 'expired' },
    },
    {
      $sort: {
        scheduledDate: -1,
      },
    },
    {
      $group: {
        _id: '$orgId',
        scheduledDate: {
          $first: '$scheduledDate',
        },
        quizId: {
          $first: '$_id',
        },
      },
    },
    {
      $project: {
        orgId: '$_id',
        scheduledDate: 1,
        quizId: 1,
        _id: 0,
      },
    },
  ]);
};

// will need to change this later ---
export const getCAnITQuizzesScheduledTomm = () => {
  return Quiz.aggregate([
    {
      $match: {
        genre: 'CAnIT',
        status: 'upcoming',
      },
    },
    {
      $sort: {
        scheduledDate: 1,
      },
    },
    {
      $group: {
        _id: '$orgId',
        scheduledDate: { $first: '$scheduledDate' },
        quizId: { $first: '$_id' },
      },
    },
    {
      $project: {
        orgId: '$_id',
        scheduledDate: 1,
        quizId: 1,
        _id: 0,
      },
    },
  ]);
};

export const scheduleNewWeeklyQuiz = (orgId, date, genre) => {
  return Quiz.create({
    orgId,
    status: 'upcoming',
    scheduledDate: date,
    genre,
  });
};

export const makeWeeklyQuizLive = async (date = new Date()) => {
  date.setHours(0, 0, 0, 0);

  return Quiz.bulkWrite([
    {
      updateMany: {
        filter: {
          status: { $in: ['upcoming'] },
          scheduledDate: {
            $lte: date,
          },
        },
        update: { $set: { status: 'cancelled' } },
      },
    },
    {
      updateMany: {
        filter: {
          status: 'scheduled',
          scheduledDate: {
            $lte: date,
          },
        },
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
