class AdminService {
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  async getAllOrgAdmins(orgId) {
    return await this.adminRepository.getAllOrgAdmins(orgId);
  }
}

export default AdminService;
