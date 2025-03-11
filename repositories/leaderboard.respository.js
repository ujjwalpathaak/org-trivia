import Badge from '../models/badge.model.js';
import Employee from '../models/employee.model.js';
import Leaderboard from '../models/leaderboard.model.js';
import { ObjectId } from 'mongodb';

class LeaderboardRepository {
  async updateLeaderboard(orgId, employeeId, newScore, month, year) {
    return Leaderboard.updateOne(
      {
        orgId: new ObjectId(orgId),
        employeeId: new ObjectId(employeeId),
        month: month,
        year: year,
      },
      { $inc: { totalScore: newScore } },
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

  async getEmployeePastRecords(orgId) {
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

  async addBadgesToEmployees(employeeId, badgeId, month, year) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      { $push: { badges: {badgeId: new ObjectId(badgeId), description: `${months[month]} ${year}`} } },
    );
  }

  async resetLeaderboard(month, year, pMonth, pYear) {
    const topThreePerOrg = await Leaderboard.aggregate([
      { $match: { month: pMonth, year: pYear, totalScore: { $ne: 0 } } },
      { $sort: { orgId: 1, totalScore: -1 } },
      {
        $group: {
          _id: { orgId: "$orgId" },
          topEmployees: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          orgId: "$_id.orgId",
          topEmployees: { $slice: ["$topEmployees", 3] },
        },
      },
    ]);
    
    const goldBadge = await Badge.findOne({ rank: "Gold" });
      const silverBadge = await Badge.findOne({ rank: "Silver" });
    const bronzeBadge = await Badge.findOne({ rank: "Bronze" });

    for (const { orgId, topEmployees } of topThreePerOrg) {
      if (topEmployees[0]) await this.addBadgesToEmployees(topEmployees[0].employeeId, goldBadge._id, pMonth, pYear);
      if (topEmployees[1]) await this.addBadgesToEmployees(topEmployees[1].employeeId, silverBadge._id, pMonth, pYear);
      if (topEmployees[2]) await this.addBadgesToEmployees(topEmployees[2].employeeId, bronzeBadge._id, pMonth, pYear);
    }    
  
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
