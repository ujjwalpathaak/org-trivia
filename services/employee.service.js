class EmployeeService {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async getAllOrgEmployeesByOrgId(orgId) {
    const employees =
      await this.employeeRepository.getAllOrgEmployeesByOrgId(orgId);
    if (!employees) {
      return { status: 404, data: { message: 'No Employees found' } };
    }

    return { status: 200, data: employees };
  }
}

export default EmployeeService;
