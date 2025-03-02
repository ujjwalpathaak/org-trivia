import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';

class EmployeeRepository {
  async getAllOrgEmployeesByOrgId(orgId) {
    const employee = await Employee.find({ org: orgId });

    return employee;
  }

  async updateWeeklyQuizScore(employeeId, newScore) {
    const employee = await Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      { $inc: { currentPoints: newScore } },
    );

    return employee;
  }
}

export default EmployeeRepository;
