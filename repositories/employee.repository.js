import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';

class EmployeeRepository {
  async getAllOrgEmployeesByOrgId(orgId) {
    const employees = await Employee.find({ org: orgId });

    return employees;
  }

  async updateWeeklyQuizScore(employeeId, updatedWeeklyQuizScore) {
    await Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      { $inc: { currentPoints: updatedWeeklyQuizScore } },
    );

    return;
  }
}

export default EmployeeRepository;
