import Employee from '../models/employee.model.js';
import { ObjectId } from 'mongodb';

class EmployeeRepository {
  async getAllOrgEmployeesByOrgId(orgId) {
    return await Employee.find({ org: orgId });
  }

  async updateWeeklyQuizScore(employeeId, newScore) {
    return await Employee.updateOne(
      { _id: new ObjectId(employeeId) },
      { $inc: { currentPoints: newScore } },
    );
  }
}

export default EmployeeRepository;
