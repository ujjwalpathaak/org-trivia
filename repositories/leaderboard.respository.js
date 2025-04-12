import { ObjectId } from 'mongodb';

import Leaderboard from '../models/leaderboard.model.js';
import { findBadgeByRank } from './badge.repository.js';
import {
  addBadgesToEmployees,
  resetAllEmployeesScores,
} from './employee.repository.js';

export const getLeaderboardYearBoundary = async () => {
  const data = await Leaderboard.aggregate([
    {
      $match: {
        orgId: new ObjectId('67c69382f8c3ce19ef544cad'),
      },
    },
    {
      $group: {
        _id: '$orgId',
        years: {
          $min: '$year',
        },
      },
    },
    {
      $project: {
        _id: 0,
        years: 1,
      },
    },
  ]);

  if (data.length === 0) {
    return new Date().getUTCFullYear();
  }

  return data[0].years;
};

export const updateLeaderboard = async (
  orgId,
  employeeId,
  score,
  month,
  year,
  session,
) =>
  Leaderboard.updateOne(
    {
      orgId: new ObjectId(orgId),
      employeeId: new ObjectId(employeeId),
      month,
      year,
    },
    { $inc: { totalScore: score } },
    { upsert: true, session },
  );

export const rollbackLeaderboardScores = async (quizId, date) => {
  const newDate = new Date(date);
  const month = newDate.getUTCMonth();
  const year = newDate.getUTCFullYear();

  return Leaderboard.aggregate([
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

export const getLeaderboardByOrg = async (orgId, month, year) => {
  return Leaderboard.aggregate([
    {
      $match: {
        orgId: new ObjectId(orgId),
        month: parseInt(month),
        year: parseInt(year),
        totalScore: { $gt: 0 },
      },
    },
    { $sort: { totalScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    { $project: { 'employee.name': 1, totalScore: 1 } },
  ]);
};

export const resetLeaderboard = async (month, year, pMonth, pYear) => {
  const topThreePerOrg = await Leaderboard.aggregate([
    { $match: { month: pMonth, year: pYear, totalScore: { $gt: 0 } } },
    { $sort: { orgId: 1, totalScore: -1 } },
    {
      $group: {
        _id: '$orgId',
        topEmployees: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        orgId: '$_id',
        topEmployees: { $slice: ['$topEmployees', 3] },
      },
    },
  ]);

  const badges = {
    Gold: await findBadgeByRank('Gold'),
    Silver: await findBadgeByRank('Silver'),
    Bronze: await findBadgeByRank('Bronze'),
  };

  const ranks = ['Gold', 'Silver', 'Bronze'];

  await Promise.all(
    topThreePerOrg.map(({ topEmployees }) =>
      Promise.all(
        topEmployees.map(async (employee, index) => {
          if (badges[ranks[index]]) {
            await addBadgesToEmployees(
              employee.employeeId,
              badges[ranks[index]]._id,
              pMonth,
              pYear,
            );
          }
        }),
      ),
    ),
  );

  await resetAllEmployeesScores();

  return { message: 'Leaderboard reset successfully' };
};
