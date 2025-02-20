class EmployeeService {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    async getAllEmployees () {
        this.employeeRepository.getAllEmployees();
    }

    async getAllOrgEmployees (orgId) {
        return await this.employeeRepository.getAllOrgEmployees(orgId);
    }


}

export default EmployeeService;
