import Employee from '../models/employee.model.js';

class EmployeeRepository {
  async getAllOrgEmployeesByOrgId(orgId) {
    return await Employee.find({ org: orgId });
  }
}

export default EmployeeRepository;
