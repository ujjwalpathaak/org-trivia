import Leaderboard from '../models/leaderboard.model.js';

import { ObjectId } from 'mongodb';

import EmployeeRepository from './employee.repository.js';
import BadgeRepository from './badge.repository.js';

const employeeRepository = new EmployeeRepository();
const badgeRepository = new BadgeRepository();

class LeaderboardRepository {
  async updateLeaderboard(orgId, employeeId, score, month, year) {
    return Leaderboard.updateOne(
      {
        orgId: new ObjectId(orgId),
        employeeId: new ObjectId(employeeId),
        month: month,
        year: year,
      },
      { $inc: { totalScore: score } },
      { upsert: true },
    );
  }

  async getLeaderboardByOrg(orgId, month, year) {
    return Leaderboard.aggregate([
      {
        $match: {
          orgId: new ObjectId(orgId),
          month: month,
          year: year,
          totalScore: { $ne: 0 },
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
      { $project: { employee: 1, totalScore: 1 } },
    ]);
  }

  async getEmployeePastResults(orgId) {
    return Leaderboard.aggregate([
      { $match: { orgId: new ObjectId(orgId) } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      { $project: { employee: 1, totalScore: 1 } },
    ]);
  }

  async getLast3Leaderboards(orgId) {
    return Leaderboard.aggregate([
      { $match: { orgId: new ObjectId(orgId) } },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          leaderboard: { $push: '$$ROOT' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 3 },
      { $skip: 1 },
      { $unwind: '$leaderboard' },
      {
        $lookup: {
          from: 'employees',
          localField: 'leaderboard.employeeId',
          foreignField: '_id',
          as: 'employeeDetails',
        },
      },
      { $unwind: '$employeeDetails' },
      { $sort: { 'leaderboard.totalScore': -1 } },
      {
        $group: {
          _id: { month: '$_id.month', year: '$_id.year' },
          employees: {
            $push: {
              employeeId: '$leaderboard.employeeId',
              name: '$employeeDetails.name',
              totalScore: '$leaderboard.totalScore',
            },
          },
        },
      },

      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          employees: { $slice: ['$employees', 3] },
        },
      },
    ]);
  }

  async resetLeaderboard(month, year, pMonth, pYear) {
    const topThreePerOrg = await Leaderboard.aggregate([
      { $match: { month: pMonth, year: pYear, totalScore: { $ne: 0 } } },
      { $sort: { orgId: 1, totalScore: -1 } },
      {
        $group: {
          _id: { orgId: '$orgId' },
          topEmployees: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          orgId: '$_id.orgId',
          topEmployees: { $slice: ['$topEmployees', 3] },
        },
      },
    ]);

    const goldBadge = await badgeRepository.findBadgeByRank('Gold');
    const silverBadge = await badgeRepository.findBadgeByRank('Silver');
    const bronzeBadge = await badgeRepository.findBadgeByRank('Bronze');

    for (const { orgId, topEmployees } of topThreePerOrg) {
      if (topEmployees[0])
        await employeeRepository.addBadgesToEmployees(
          topEmployees[0].employeeId,
          goldBadge._id,
          pMonth,
          pYear,
        );
      if (topEmployees[1])
        await employeeRepository.addBadgesToEmployees(
          topEmployees[1].employeeId,
          silverBadge._id,
          pMonth,
          pYear,
        );
      if (topEmployees[2])
        await employeeRepository.addBadgesToEmployees(
          topEmployees[2].employeeId,
          bronzeBadge._id,
          pMonth,
          pYear,
        );
    }

    await employeeRepository.resetAllEmployeesScores();

    const uniqueCombinations = await Leaderboard.aggregate([
      {
        $group: {
          _id: { orgId: '$orgId', employeeId: '$employeeId' },
        },
      },
      {
        $project: {
          _id: 0,
          orgId: '$_id.orgId',
          employeeId: '$_id.employeeId',
          month: { $literal: month },
          year: { $literal: year },
          totalScore: { $literal: 0 },
        },
      },
    ]);

    return;

    // return Leaderboard.insertMany(uniqueCombinations);
  }
}

export default LeaderboardRepository;
