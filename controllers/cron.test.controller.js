import OrgRepository from '../repositories/org.repository.js';
import OrgService from '../services/org.service.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionRepository = new QuestionRepository();
const quesitonService = new QuestionService(questionRepository);

const orgRepository = new OrgRepository();
const orgService = new OrgService(orgRepository);

class CronTestController {
  async startPnAWorkflow(req, res, next) {
    try {
      const { orgId } = req.params;
      const response = await orgService.getOrgById(orgId);
      const org = response.data;

      quesitonService.startPnAWorkflow(org.name, orgId);
    } catch (error) {
      next(error);
    }
  }
}

export default CronTestController;
