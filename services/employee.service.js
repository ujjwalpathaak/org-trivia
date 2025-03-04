class EmployeeService {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async getAllOrgEmployeesByOrgId(orgId) {
    const orgEmployees =
      await this.employeeRepository.getAllOrgEmployeesByOrgId(orgId);

    return orgEmployees;
  }

  // ---------------------------------------

  async updateWeeklyQuizScore(employeeId, score) {
    await this.employeeRepository.updateWeeklyQuizScore(employeeId, score);

    return { status: 200, data: 'Score updated successfully' };
  }
}

export default EmployeeService;
