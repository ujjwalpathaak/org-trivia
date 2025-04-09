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

export const getQuizStatus = (orgId, date) => {
  return Quiz.findOne(
    {
      orgId: new ObjectId(orgId),
      scheduledDate: date,
    },
    { genre: 1, status: 1, _id: 0 },
  );
};

export const cancelScheduledQuiz = async (quizId) => {
  return Quiz.findOneAndUpdate(
    { _id: new ObjectId(quizId) },
    { $set: { status: 'cancelled' } },
    { returnDocument: 'after' },
  );
};

export const cancelLiveQuiz = async (quizId) => {
  return Quiz.findOneAndUpdate(
    { _id: new ObjectId(quizId), status: 'live' },
    { $set: { status: 'expired' } },
    { returnDocument: 'after' },
  );
};

export const allowScheduledQuiz = async (quizId) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'cancelled' },
    { $set: { status: 'scheduled' } },
  );
};

export const getScheduledQuizzes = (orgId, startDate, endDate) => {
  return Quiz.find({
    orgId: new ObjectId(orgId),
    scheduledDate: { $gte: startDate, $lte: endDate },
  }).sort({
    scheduledDate: 1,
  });
};

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

// development
export const getCAnITQuizzesScheduledNext = () => {
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

// production
export const getCAnITQuizzesScheduledTomm = () => {
  const today = new Date();

  const todayInUTCFormat = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return Quiz.find({
    genre: 'CAnIT',
    status: 'upcoming',
    questionGenerationDate: todayInUTCFormat,
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

export const makeQuizLive = async (date) => {
  return Quiz.bulkWrite([
    {
      updateMany: {
        filter: {
          status: 'upcoming',
          scheduledDate: date,
        },
        update: { $set: { status: 'cancelled' } },
      },
    },
    {
      updateMany: {
        filter: {
          status: 'scheduled',
          scheduledDate: date,
        },
        update: { $set: { status: 'live' } },
      },
    },
  ]);
};

export const markAllLiveQuizAsExpired = async () => {
  const liveQuizzes = await Quiz.find({ status: 'live' }, { _id: 1 }).lean();
  const quizIds = liveQuizzes.map((q) => q._id);

  await Quiz.updateMany(
    { _id: { $in: quizIds } },
    { $set: { status: 'expired' } },
  );

  return quizIds;
};

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

export const getQuizByQuizId = (quizId) => {
  return Quiz.findOne({ _id: new ObjectId(quizId) });
};

export const changeQuizGenre = async (newGenre, quizId) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'upcoming' },
    { $set: { genre: newGenre } },
  );
};
