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