import { ObjectId } from 'mongodb';

import Result from '../models/result.model.js';

export const submitWeeklyQuizAnswers = async (
  employeeId,
  orgId,
  quizId,
  score,
  points,
  genre,
  answers,
  session,
) => {
  const resultDoc = {
    employeeId,
    orgId,
    quizId,
    score,
    points,
    genre,
    answers,
  };

  return await Result.create([resultDoc], { session });
};

export const rollbackLeaderboardScores = async (quizId, date) => {
  const newDate = new Date(date);
  const month = newDate.getUTCMonth();
  const year = newDate.getUTCFullYear();

  return Result.aggregate([
    {
      $match: {
        quizId: new ObjectId(quizId),
      },
    },
    {
      $lookup: {
        from: 'leaderboards',
        localField: 'employeeId',
        foreignField: 'employeeId',
        as: 'leaderboard',
      },
    },
    { $unwind: '$leaderboard' },
    {
      $match: {
        'leaderboard.month': month,
        'leaderboard.year': year,
      },
    },
    {
      $addFields: {
        'leaderboard.totalScore': {
          $subtract: [
            { $ifNull: ['$leaderboard.totalScore', 0] },
            { $ifNull: ['$score', 0] },
          ],
        },
      },
    },
    {
      $replaceRoot: { newRoot: '$leaderboard' },
    },
    {
      $merge: {
        into: 'leaderboards',
        on: '_id',
        whenMatched: 'merge',
        whenNotMatched: 'discard',
      },
    },
  ]);
};

export const rollbackWeeklyQuizScores = async (quizId) => {
  await Result.aggregate([
    {
      $match: {
        quizId: new ObjectId(quizId),
      },
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    {
      $unwind: {
        path: '$employee',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: {
        'employee.score': {
          $subtract: [
            { $ifNull: ['$employee.score', 0] },
            { $ifNull: ['$score', 0] },
          ],
        },
      },
    },
    {
      $replaceRoot: { newRoot: '$employee' },
    },
    {
      $merge: {
        into: 'employees',
        on: '_id',
        whenMatched: 'merge',
        whenNotMatched: 'discard',
      },
    },
  ]);

  return await Result.deleteMany({ quizId: new ObjectId(quizId) });
};

export const findOrgResults = async (quizId) => {
  return Result.find({ quizId: new ObjectId(quizId) });
};

export const getParticipationByGenre = async (orgId) => {
  return await Result.aggregate([
    { $match: { orgId: new ObjectId(orgId) } },
    {
      $group: {
        _id: '$genre',
        count: { $sum: 1 },
      },
    },
  ]);
};

export const findResultByQuizId = (quizId) => {
  return Result.findOne({ quizId: new ObjectId(quizId) });
};

export const getEmployeePastResults = async (
  employeeId,
  page = 0,
  size = 10,
) => {
  const skip = parseInt(page) * parseInt(size);
  const limit = parseInt(size);

  const results = await Result.aggregate([
    { $match: { employeeId: new ObjectId(employeeId) } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'total' }],
      },
    },
  ]);

  const data = results[0].data;
  const total =
    results[0].totalCount.length > 0 ? results[0].totalCount[0].total : 0;

  return { data, total, page, size };
};
