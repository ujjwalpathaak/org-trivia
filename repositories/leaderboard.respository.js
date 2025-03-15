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
        month,
        year,
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
          month,
          year,
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
      { $project: { 'employee.name': 1, totalScore: 1 } },
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
      Gold: await badgeRepository.findBadgeByRank('Gold'),
      Silver: await badgeRepository.findBadgeByRank('Silver'),
      Bronze: await badgeRepository.findBadgeByRank('Bronze'),
    };

    const ranks = ['Gold', 'Silver', 'Bronze'];
    for (const { orgId, topEmployees } of topThreePerOrg) {
      topEmployees.forEach(async (employee, index) => {
        if (badges[ranks[index]]) {
          await employeeRepository.addBadgesToEmployees(
            employee.employeeId,
            badges[ranks[index]]._id,
            pMonth,
            pYear,
          );
        }
      });
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
          orgId: '$_id.orgId',
          employeeId: '$_id.employeeId',
          month,
          year,
          totalScore: 0,
        },
      },
    ]);

    return Leaderboard.insertMany(uniqueCombinations);
  }
}

export default LeaderboardRepository;
