import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';
import Result from '../models/result.model.js';

class EmployeeRepository {
  async findEmployeeById(employeeId) {
    return Employee.findOne({ _id: new ObjectId(employeeId) });
  }

  async didEmployeeGaveWeeklyQuiz(employeeId) {
    return Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { isQuizGiven: 1 },
    );
  }

  async markAllEmployeesAsQuizNotGiven() {
    return Employee.updateMany({}, { $set: { isQuizGiven: false } });
  }

  async getPastQuizResults(employeeId) {
    return Result.find(
      { employeeId: new ObjectId(employeeId) }
    ).sort({ date: -1 });
  }  

  async getAllOrgEmployeesByOrgId(orgId) {
    return Employee.find({ orgId: new ObjectId(orgId) });
  }

  async getEmployeeScore(employeeId) {
    return Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { lastQuizScore: 1 },
    );
  }

  async newMultiplier(updatedStreak) {
    switch (true) {
      case updatedStreak >= 4:
        return 1.5;
      default:
        return 1;
    }
  }

  async addSubmittedQuestion(questionId, employeeId){
    return Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      { $push: { submittedQuestions: new ObjectId(questionId) } },
    );
  }

  async getEmployeeDetails(employeeId){
    const badges = await Employee.aggregate([
      {
          $match: { _id: new ObjectId(employeeId) }
      },
      {
          $unwind: "$badges"
      },
      {
          $lookup: {
              from: "badges",
              localField: "badges.badgeId",
              foreignField: "_id",
              as: "badgeDetails"
          }
      },
      {
          $unwind: "$badgeDetails"
      },
      {
          $group: {
              _id: "$_id",
              badges: { 
                  $push: {  
                      badgeDetails: "$badgeDetails",
                      description: "$badges.description"
                  }
              }
          }
      }
  ])

    const employee = await Employee.findOne(
      { _id: new ObjectId(employeeId) },
    );
    const multiplier = await this.newMultiplier(employee.currentStreak);

    return {
      employee,
      badges: badges[0]?.badges || [],
      multiplier: multiplier,
    }
  }

  async updateWeeklyQuizScore(quizId, employeeId, updatedWeeklyQuizScore) {
    const employee = await Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { lastQuizGiven: 1, currentStreak: 1 },
    );

    let updatedStreak = 0;
    
    if (employee.lastQuizGiven) {
      updatedStreak = employee.currentStreak + 1;
    }

    const multi = await this.newMultiplier(updatedStreak);
    
    updatedWeeklyQuizScore *= multi;
    
    return Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $set: {
          idLastGivenQuiz: new ObjectId(quizId),
          isQuizGiven: true,
          lastQuizGiven: true,
          currentStreak: updatedStreak,
          lastQuizScore: updatedWeeklyQuizScore,
        },
      },
    );
  }
}

export default EmployeeRepository;
