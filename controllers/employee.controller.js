import EmployeeService from "../services/employee.service.js";
import EmployeeRepository from "../repositories/employee.repository.js";

const employeeService = new EmployeeService(new EmployeeRepository());

export const getAllEmployeesByOrg = async (request, response) => {
    try {
        const { orgId } = request.params;
    
        const employees = await employeeService.getAllOrgEmployees(orgId);
        if(!employees){
            return response.status(404).json({ message: "No Employees found" });
        }
    
        response.status(200).json({ employees });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}