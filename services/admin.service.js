import AuthService from "../services/auth.service.js";
import AuthRepository from "../repositories/auth.repository.js";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

class AdminService {
    constructor(adminRepository){
        this.adminRepository = adminRepository;
    }
    
    async getAllAdmins () {
        return await this.adminRepository.getAllAdmins();
    }

    async getAllOrgAdmins (orgId) {
        return await this.adminRepository.getAllOrgAdmins(orgId);
    }
}

export default AdminService;