class AdminService {
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  async getAllOrgAdmins(orgId) {
    const admins = await this.adminRepository.getAllOrgAdmins(orgId);

    return { status: 200, data: admins };
  }
}

export default AdminService;
