import AdminService from "../services/admin.service.js";
import AdminRepository from "../repositories/admin.repository.js";
import AuthService from "../services/auth.service.js";
import AuthRepository from "../repositories/auth.repository.js";

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

export const getAllAdminsByOrg = async (request, response) => {
    try {
        const { orgId } = request.params;
    
        const admins = adminService.getAllOrgAdmins(orgId);

        if(!admins){
            return response.status(404).json({ message: "No Admins found" });
        }
    
        response.status(200).json({ admins });
    } catch (error) {
        response.status(500).json({ message: "Server error", error: error.message });
    }
}