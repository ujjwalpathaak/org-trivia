import OrgRepository from '../repositories/org.repository.js';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionService = new QuestionService(
  new QuestionRepository(),
  new OrgRepository(),
);

class QuestionController {
  async addQuestion(req, res, next) {
    try {
      const question = req.body;
      const errors =
        await questionService.validateEmployeeQuestionSubmission(question);
      if (errors) {
        return res.status(400).json(errors);
      }

      const isQuestionAdded = await questionService.saveQuestion(question);
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
          .status(404)
          .json({ message: 'No questions scheduled till now' });

      const [
        weeklyUnapprovedQuestions,
        extraAIQuestions,
        extraEmployeeQuestions,
      ] = await Promise.all([
        questionService.getWeeklyUnapprovedQuestions(orgId, upcomingQuiz._id),
        questionService.getExtraAIQuestions(
          orgId,
          upcomingQuiz._id,
          upcomingQuiz.genre,
        ),
        questionService.getExtraEmployeeQuestions(
          orgId,
          upcomingQuiz._id,
          upcomingQuiz.genre,
        ),
      ]);

      console.log(
        weeklyUnapprovedQuestions,
        extraAIQuestions,
        extraEmployeeQuestions,
      );

      if (!weeklyUnapprovedQuestions)
        return res
          .status(404)
          .json({ message: 'No questions scheduled till now' });

      res
        .status(200)
        .json({
          weeklyUnapprovedQuestions: weeklyUnapprovedQuestions,
          extraAIQuestions: extraAIQuestions,
          extraEmployeeQuestions: extraEmployeeQuestions,
        });
    } catch (error) {
      next(error);
    }
  }

  async saveHRdocQuestions(req, res, next) {
    try {
      const { orgId, questions } = req.body;
      if (!orgId || !questions) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const response = await questionService.saveHRdocQuestions(
        orgId,
        questions,
      );

      res.status(200).json(response);
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
