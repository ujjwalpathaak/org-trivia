import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';

import { calculateMultiplier, getMonth } from '../middleware/utils.js';

class EmployeeRepository {
  async isWeeklyQuizGiven(employeeId) {
    return Employee.findById(employeeId, 'quizGiven');
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
      { updateMany: { filter: {}, update: { $set: { quizGiven: false } } } },
    ]);
  }

  async addSubmittedQuestion(questionId, employeeId) {
    return Employee.updateOne(
      { _id: employeeId },
      { $push: { submittedQuestions: questionId } },
    );
  }

  async updateWeeklyQuizScore(employeeId, points) {
    const employee = await Employee.findById(
      employeeId,
      'streak score quizGiven',
    );
    if (employee.quizGiven) return false;

    const multiplier = calculateMultiplier(employee.streak);
    const updatedScore = points * multiplier;

    await Employee.updateOne(
      { _id: employeeId },
      { $set: { quizGiven: true }, $inc: { score: updatedScore } },
    );

    return { multiplier, score: updatedScore };
  }

  async addBadgesToEmployees(employeeId, badgeId, month, year) {
    return Employee.updateOne(
      { _id: employeeId },
      {
        $push: {
          badges: { badgeId, description: `${getMonth(month)} ${year}` },
        },
      },
    );
  }

  async resetAllEmployeesScores() {
    return Employee.updateMany({}, { $set: { score: 0, streak: 0 } });
  }

  async getEmployeeDetails(employeeId) {
    const employee = await Employee.findById(employeeId).lean();
    if (!employee) return null;

    const badges = await Employee.aggregate([
      { $match: { _id: new ObjectId(employeeId) } },
      { $unwind: '$badges' },
      { $sort: { 'badges.earnedAt': -1 } },
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

    return {
      employee,
      badges: badges[0]?.badges || [],
      multiplier: calculateMultiplier(employee.streak),
    };
  }
}

export default EmployeeRepository;
