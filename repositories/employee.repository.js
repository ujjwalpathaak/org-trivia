import Employee from '../models/employee.model.js';

import { ObjectId } from 'mongodb';

class EmployeeRepository {
  async findEmployeeById(employeeId){
    return Employee.findOne({ _id: new ObjectId(employeeId) });
  }

  async didEmployeeGaveWeeklyQuiz(employeeId) {
    return Employee.findOne(
      { _id: new ObjectId(employeeId) },
      { isQuizGiven: 1 }
    );
  }

  // ----------------------------------------------------------------

  async getAllOrgEmployeesByOrgId(orgId) {
    const orgEmployees = await Employee.find({ orgId: new ObjectId(orgId) });

    return orgEmployees;
  }

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
