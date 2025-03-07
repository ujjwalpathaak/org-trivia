import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';

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

  async getAllOrgEmployeesByOrgId(orgId) {
    return Employee.find({ orgId: new ObjectId(orgId) });
  }

  async getEmployeeScore(employeeId) {
    return Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { lastQuizScore: 1, currentPoints: 1 },
    );
  }

  async updateWeeklyQuizScore(employeeId, updatedWeeklyQuizScore) {
    return Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $inc: { currentPoints: updatedWeeklyQuizScore },
        $set: { isQuizGiven: true, lastQuizScore: updatedWeeklyQuizScore },
      },
    );
  }
}

export default EmployeeRepository;
