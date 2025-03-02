import AdminService from '../services/admin.service.js';
import AdminRepository from '../repositories/admin.repository.js';

const adminService = new AdminService(new AdminRepository());

export const getAllAdminsByOrg = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ message: 'Org ID is required' });
    }

    const response = await adminService.getAllOrgAdmins(orgId);
    if (!response.data) {
      return res.status(404).json({ message: 'No Admins found' });
    }

    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
};
