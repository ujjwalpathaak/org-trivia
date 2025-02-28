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

  async toggleTrivia(req, res, next) {
    try {
      const { orgId } = req.params;
      const response = await orgService.toggleTrivia(orgId);

      console.log(response.data)

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const { orgId } = req.params;
      const response = await orgService.getSettings(orgId);

      res.status(response.status).json(response.data);
    } catch (error) {
      next(error);
    }
  }
}

export default OrgController;
