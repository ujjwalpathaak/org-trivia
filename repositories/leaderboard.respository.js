import { ObjectId } from 'mongodb';

import Leaderboard from '../models/leaderboard.model.js';
import { findBadgeByRank } from './badge.repository.js';
import {
  addBadgesToEmployees,
  resetAllEmployeesScores,
} from './employee.repository.js';

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

export const getLeaderboardYearBoundary = async (orgId) => {
  return Leaderboard.aggregate([
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
