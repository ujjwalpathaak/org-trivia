import Employee from "../models/employee.model.js";

class EmployeeRepository {
    async getAllEmployeesByOrg(orgId) {
        return await Employee.find({ org: orgId });
    }
}

export default EmployeeRepository;