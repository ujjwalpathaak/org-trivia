import OrgService from '../services/org.service.js';
import OrgRepository from '../repositories/org.repository.js';

const orgService = new OrgService(new OrgRepository());

class OrgController {
  async getAllOrgNames(req, res, next) {
    try {
      const response = await orgService.getAllOrgNames();

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default OrgController;
