import EmployeeService from '../services/employee.service.js';
import EmployeeRepository from '../repositories/employee.repository.js';

const employeeService = new EmployeeService(new EmployeeRepository());

class EmployeeController {
  async getAllOrgEmployeesByOrgId(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const response = await employeeService.getAllOrgEmployeesByOrgId(orgId);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default EmployeeController;
