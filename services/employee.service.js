class EmployeeService {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async getAllOrgEmployeesByOrgId(orgId) {
    const orgEmployees =
      await this.employeeRepository.getAllOrgEmployeesByOrgId(orgId);

    return orgEmployees;
  }

  async fetchEmployeeScore(employeeId) {
    return await this.employeeRepository.getEmployeeScore(employeeId);
  }
}

export default EmployeeService;
