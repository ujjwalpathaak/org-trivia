import OrgRepository from "../repositories/org.repository.js";
import QuestionRepository from "../repositories/question.repository.js";
import OrgService from "../services/org.service.js";
import QuestionService from "../services/question.service.js";

const quesitonService = new QuestionService(new QuestionRepository())
const orgService = new OrgService(new OrgRepository())

export const startPnAWorkflow = async (req, res) => {
    const { orgId } = req.params;
    console.log("startPnAWorkflow - orgId", orgId)
    const org = await orgService.getOrgById(orgId)
    console.log("startPnAWorkflow - name", org.name)
    quesitonService.startPnAWorkflow(org.name, orgId);
}