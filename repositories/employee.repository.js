import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';
import Result from '../models/result.model.js';

class EmployeeRepository {
  async isWeeklyQuizGiven(employeeId) {
    return Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { quizGiven: 1 },
    );
  }

  // ---------------------------------

  async updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven() {
    await Employee.bulkWrite([
      {
        updateMany: {
          filter: { quizGiven: true },
          update: { $inc: { streak: 1 } },
        },
      },
      {
        updateMany: {
          filter: { quizGiven: false },
          update: { $set: { streak: 0 } },
        },
      },
      {
        updateMany: {
          filter: {},
          update: { $set: { quizGiven: false } },
        },
      },
    ]);
  }

  async getPastQuizResults(employeeId) {
    return Result.find({ employeeId: new ObjectId(employeeId) }).sort({
      date: -1,
    });
  }

  async getAllOrgEmployeesByOrgId(orgId) {
    return Employee.find({ orgId: new ObjectId(orgId) });
  }

  async newMultiplier(updatedStreak) {
    switch (true) {
      case updatedStreak >= 4:
        return 1.5;
      default:
        return 1;
    }
  }

  async addSubmittedQuestion(questionId, employeeId) {
    return Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      { $push: { submittedQuestions: new ObjectId(questionId) } },
    );
  }

  async getEmployeeDetails(employeeId) {
    const objectId = new ObjectId(employeeId);

    // Aggregation to get recent 3 badges
    const badges = await Employee.aggregate([
      { $match: { _id: objectId } },
      { $unwind: '$badges' },
      { $sort: { 'badges.earnedAt': -1 } }, // Sort before grouping
      {
        $lookup: {
          from: 'badges',
          localField: 'badges.badgeId',
          foreignField: '_id',
          as: 'badgeDetails',
        },
      },
      { $unwind: '$badgeDetails' },
      {
        $group: {
          _id: '$_id',
          badges: {
            $push: {
              badgeDetails: '$badgeDetails',
              description: '$badges.description',
              rank: '$badges.rank',
              earnedAt: '$badges.earnedAt',
            },
          },
        },
      },
    ]);

    const employee = await Employee.findOne({ _id: objectId });
    const multiplier = await this.newMultiplier(employee.streak);

    return {
      employee,
      badges: badges[0]?.badges || [],
      multiplier,
    };
  }

  async updateWeeklyQuizScore(quizId, employeeId, points) {
    const employee = await Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { streak: 1, score: 1 },
    );

    const multiplier = await this.newMultiplier(employee.streak);

    const updatedScore = points * multiplier;

    await Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $set: {
          quizGiven: true,
          score: employee.score + updatedScore,
        },
      },
    );

    return { multiplier: multiplier, score: updatedScore };
  }
}

export default EmployeeRepository;
