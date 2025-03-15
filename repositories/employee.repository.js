import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';

import { calculateMultiplier } from '../middleware/utils.js';

class EmployeeRepository {
  async isWeeklyQuizGiven(employeeId) {
    return Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { quizGiven: 1 },
    );
  }

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

  async getAllOrgEmployeesByOrgId(orgId) {
    return Employee.find({ orgId: new ObjectId(orgId) });
  }

  async addSubmittedQuestion(questionId, employeeId) {
    return Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      { $push: { submittedQuestions: new ObjectId(questionId) } },
    );
  }

  async updateWeeklyQuizScore(employeeId, points) {
    const employee = await Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { streak: 1, score: 1 },
    );

    const multiplier = calculateMultiplier(employee.streak);

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

  async addBadgesToEmployees(employeeId, badgeId, month, year) {
    return Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $push: {
          badges: {
            badgeId: new ObjectId(badgeId),
            description: `${getMonth(month)} ${year}`,
          },
        },
      },
    );
  }

  async resetAllEmployeesScores() {
    return Employee.updateMany({}, { $set: { score: 0 } });
  }

  async getEmployeeDetails(employeeId) {
    const objectId = new ObjectId(employeeId);

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
    const multiplier = calculateMultiplier(employee.streak);

    return {
      employee,
      badges: badges[0]?.badges || [],
      multiplier,
    };
  }
}

export default EmployeeRepository;
