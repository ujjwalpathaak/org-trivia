import OrgRepository from '../repositories/org.repository.js';
import OrgService from '../services/org.service.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionRepository = new QuestionRepository();
const questionservice = new QuestionService(questionRepository);

const orgRepository = new OrgRepository();
const orgService = new OrgService(orgRepository);

class CronTestController {
  async startPnAWorkflow(req, res, next) {
    try {
      const { orgId } = req.params;
      const response = await orgService.getOrgById(orgId);
      const org = response.data;

      questionservice.startPnAWorkflow(org.name, orgId);
    } catch (error) {
      next(error);
    }
  }
  async startCAnITWorkflow(req, res, next) {
    try {
      const { orgId } = req.params;
      const response = await orgService.getOrgById(orgId);
      const org = response.data;

      questionservice.startCAnITWorkflow(org.name, org.industry, orgId);
    } catch (error) {
      next(error);
    }
  }
}

export default CronTestController;
