import Employee from "../models/employee.model.js";

export const getAllEmployees = async (request, response) => {
    try {
        const employees = await Employee.find({});

        response.status(200).json({ employees });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}

// test
export const getEmployeeByEmail = async (request, response) => {
    try {
        const { email } = request.params;
    
        const employee = await Employee.findOne({ email });
        if(!employee){
            return response.status(404).json({ message: "No Employee found" });
        }
    
        response.status(200).json({ employee });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}

// test
export const getAllEmployeesByOrg = async (request, response) => {
    try {
        const { orgId } = request.params;
    
        const employees = await Employee.find({ org: orgId });
        if(!employees){
            return response.status(404).json({ message: "No Employees found" });
        }
    
        response.status(200).json({ employees });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}