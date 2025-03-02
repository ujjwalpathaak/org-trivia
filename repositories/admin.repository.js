import Admin from '../models/admin.model.js';

class AdminRepository {
  async getAllOrgAdmins(orgId) {
    const admins = await Admin.find({ org: orgId });

    return admins;
  }
}

export default AdminRepository;
