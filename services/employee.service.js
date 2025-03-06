class EmployeeService {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async getAllOrgEmployeesByOrgId(orgId) {
    const orgEmployees =
      await this.employeeRepository.getAllOrgEmployeesByOrgId(orgId);

    return orgEmployees;
  }
}

export default EmployeeService;
