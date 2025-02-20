import Employee from "../models/employee.model.js";

class EmployeeRepository {
    async getAllEmployees() {
        return await Employee.find({});
    }

    async getEmployeeByEmail(email) {
        return await Employee.findOne({ email });
    }

    async getAllOrgEmployees(orgId) {
        return await Employee.find({ org: orgId });
    }
}

export default EmployeeRepository;