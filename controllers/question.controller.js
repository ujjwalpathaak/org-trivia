import EmployeeRepository from '../repositories/employee.repository.js';
import OrgRepository from '../repositories/org.repository.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuizRepository from '../repositories/quiz.repository.js';
import QuestionService from '../services/question.service.js';

const questionService = new QuestionService(
  new QuestionRepository(),
  new OrgRepository(),
  new EmployeeRepository(),
  new QuizRepository(),
);

class QuestionController {
  async addQuestion(req, res, next) {
    try {
      const data = req.body;
      const errors = await questionService.validateEmployeeQuestionSubmission(
        data.question,
      );
      if (errors) {
        return res.status(400).json(errors);
      }

      const isQuestionAdded = await questionService.saveQuestion(
        data.question,
        data.employeeId,
      );
      if (!isQuestionAdded)
        res.status(404).json({ message: 'Not able to save question' });

      res.status(200).json({ message: 'New question saved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyUnapprovedQuestions(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const upcomingQuiz =
        await questionService.getUpcomingWeeklyQuizByOrgId(orgId);
      if (!upcomingQuiz)
        return res
          .status(400)
          .json({ message: 'No questions scheduled till now' });

      const weeklyUnapprovedQuestions =
        await questionService.getWeeklyUnapprovedQuestions(
          orgId,
          upcomingQuiz._id,
        );
      const extraEmployeeQuestions =
        await questionService.getExtraEmployeeQuestions(
          orgId,
          upcomingQuiz._id,
          upcomingQuiz.genre,
        );

      if (!weeklyUnapprovedQuestions)
        return res
          .status(400)
          .json({ message: 'No questions scheduled till now' });

      res
        .status(200)
        .json({ weeklyUnapprovedQuestions, extraEmployeeQuestions });
    } catch (error) {
      next(error);
    }
  }

  async testScheduleNextWeekQuestionsApproval(req, res, next) {
    try {
      await questionService.scheduleNextWeekQuestionsApproval();

      res.json('Job running');
    } catch (error) {
      next(error);
    }
  }
}

export default QuestionController;
