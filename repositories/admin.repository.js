import Admin from "../models/admin.model.js";

class AdminRepository {
    async getAllAdmins() {
        return await Admin.find({});
    }

    async getAdminByEmail(email) {
        return await Admin.findOne({ email });
    }

    async getAllOrgAdmins(orgId) {
        return await Admin.find({ org: orgId });
    }
}

export default AdminRepository;