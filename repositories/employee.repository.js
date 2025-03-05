import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';

class EmployeeRepository {
  async getAllOrgEmployeesByOrgId(orgId) {
    const orgEmployees = await Employee.find({ orgId: new ObjectId(orgId) });

    return orgEmployees;
  }
  // ----------------------------------------------------------------

  async updateWeeklyQuizScore(employeeId, updatedWeeklyQuizScore) {
    await Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $inc: { currentPoints: updatedWeeklyQuizScore },
        $set: { isQuizGiven: true },
      },
    );

    return;
  }
}

export default EmployeeRepository;
