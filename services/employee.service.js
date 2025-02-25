class EmployeeService {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async getAllEmployeesByOrg(orgId) {
    return await this.employeeRepository.getAllEmployeesByOrg(orgId);
  }
}

export default EmployeeService;
