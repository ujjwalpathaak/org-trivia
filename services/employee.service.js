class EmployeeService {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async fetchEmployeeScore(employeeId) {
    return await this.employeeRepository.getEmployeeScore(employeeId);
  }

  async getEmployeeDetails(employeeId) {
    return await this.employeeRepository.getEmployeeDetails(employeeId);
  }

  async getPastQuizResults(employeeId) {
    return await this.employeeRepository.getPastQuizResults(employeeId);
  }

  async getSubmittedQuestions(employeeId, page, size) {
    return await this.employeeRepository.getSubmittedQuestions(
      employeeId,
      page,
      size,
    );
  }
}

export default EmployeeService;
