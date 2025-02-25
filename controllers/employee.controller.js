import EmployeeService from '../services/employee.service.js';
import EmployeeRepository from '../repositories/employee.repository.js';

const employeeRepository = new EmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);

class EmployeeController {
  async getAllOrgEmployeesByOrgId(req, res, next) {
    try {
      const { orgId } = req.params;

      const response = await employeeService.getAllOrgEmployeesByOrgId(orgId);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default EmployeeController;
