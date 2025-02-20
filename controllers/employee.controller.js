import EmployeeService from "../services/employee.service.js";
import EmployeeRepository from "../repositories/employee.repository.js";
import AuthService from "../services/auth.service.js";
import AuthRepository from "../repositories/auth.repository.js";

const authService = new AuthService(new AuthRepository());
const employeeService = new EmployeeService(new EmployeeRepository());

export const getAllEmployees = async (request, response) => {
    try {
        const employees = await employeeService.getAllEmployees();

        response.status(200).json({ employees });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getEmployeeByEmail = async (request, response) => {
    try {
        const { email } = request.params;
    
        const user = await authService.getUser(email);
        if(!user){
            return response.status(404).json({ message: "No Employee found" });
        }
    
        response.status(200).json({ employee });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}

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