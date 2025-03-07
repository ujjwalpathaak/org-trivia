import OrgRepository from '../repositories/org.repository.js';
import OrgService from '../services/org.service.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';
import QuizService from '../services/quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';
import EmployeeRepository from '../repositories/employee.repository.js';

const questionservice = new QuestionService(new QuestionRepository());
const orgService = new OrgService(new OrgRepository());
const quizService = new QuizService(
  new QuizRepository(),
  new EmployeeRepository(),
  new OrgRepository(),
);

class CronTestController {
  async startPnAWorkflow(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const response = await orgService.getOrgById(orgId);

      questionservice.startPnAWorkflow(response.data.name, orgId);

      res.status(200).json({ message: 'PN/A workflow started successfully' });
    } catch (error) {
      next(error);
    }
  }

  async startCAnITWorkflow(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const response = await orgService.getOrgById(orgId);

      questionservice.startCAnITWorkflow(
        response.data.name,
        org.industry,
        orgId,
      );

      res.status(200).json({ message: 'CAnIT workflow started successfully' });
    } catch (error) {
      next(error);
    }
  }

  async makeQuizLiveTest(req, res, next) {
    try {
      await quizService.makeQuizLiveTest();

      res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }

  async cleanWeeklyQuiz(req, res, next) {
    try {
      const response = await quizService.cleanUpWeeklyQuiz();

      res.status(200).json({ message: 'Weekly quiz cleaned successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default CronTestController;
