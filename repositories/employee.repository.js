import Employee from '../models/employee.model.js';

class EmployeeRepository {
  async getAllOrgEmployeesByOrgId(orgId) {
    return await Employee.find({ org: orgId });
  }

  async updateWeeklyQuizScore(employeeId, newScore) {
    return await Employee.updateOne(
      { employeeId: employeeId },
      { $inc: { score: newScore } },
    );
  }
}

export default EmployeeRepository;
