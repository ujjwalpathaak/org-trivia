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
      { $match: { orgId: new ObjectId(orgId), month: month, year: year } },
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
}

export default LeaderboardRepository;
