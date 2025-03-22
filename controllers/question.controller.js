import questionService from '../services/question.service.js';

const addQuestion = async (req, res, next) => {
  try {
    const { question, employeeId } = req.body;
    const errors =
      await questionService.validateEmployeeQuestionSubmission(question);
    if (errors) {
      return res.status(400).json(errors);
    }

    const isQuestionAdded = await questionService.saveQuestion(
      question,
      employeeId,
    );
    if (!isQuestionAdded) {
      return res.status(404).json({ message: 'Not able to save question' });
    }

    res.status(200).json({ message: 'New question saved successfully' });
  } catch (error) {
    next(error);
  }
};

const getWeeklyUnapprovedQuestions = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const upcomingQuiz =
      await questionService.getUpcomingWeeklyQuizByOrgId(orgId);
    if (!upcomingQuiz) {
      return res
        .status(400)
        .json({ message: 'No questions scheduled till now' });
    }

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

    if (!weeklyUnapprovedQuestions) {
      return res
        .status(400)
        .json({ message: 'No questions scheduled till now' });
    }

    res.status(200).json({ weeklyUnapprovedQuestions, extraEmployeeQuestions });
  } catch (error) {
    next(error);
  }
};

const testScheduleNextWeekQuestionsApproval = async (req, res, next) => {
  try {
    await questionService.scheduleNextWeekQuestionsApproval();
    res.json('Job running');
  } catch (error) {
    next(error);
  }
};

export default {
  addQuestion,
  getWeeklyUnapprovedQuestions,
  testScheduleNextWeekQuestionsApproval,
};
