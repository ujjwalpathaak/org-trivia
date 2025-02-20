import Admin from "../models/admin.model.js";
import Employee from "../models/employee.model.js";

class AuthRepository {
    async getUserByEmail(email) {
        const [admin, employee] = await Promise.all([
            Admin.findOne({ email }),
            Employee.findOne({ email })
        ]);
        return admin || employee || null;
    }
    
    async saveUser(user) {
        return await user.save();
    }
}

export default AuthRepository;