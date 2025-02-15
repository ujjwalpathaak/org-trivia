import Employee from "../models/employee.model.js";

export const getAllEmployees = async (request, response) => {
    try {
        const employees = await Employee.find({});

        response.status(200).json({ employees });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getEmployeeByEmail = async (request, response) => {
    try {
        const { email } = request.body;
    
        const employee = await Employee.findOne({ email });
        if(!employee){
            return response.status(404).json({ message: "No Employee found" });
        }
    
        response.status(200).json({ employee });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}