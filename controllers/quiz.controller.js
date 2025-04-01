import questionService from '../services/question.service.js';
import quizService from '../services/quiz.service.js';

const getWeeklyQuizStatusController = async (req, res, next) => {
  try {
    const { orgId, employeeId } = req.data;
    if (!orgId || !employeeId)
      return res.status(404).json({ message: 'Missing organizationId' });

    const weeklyQuizStatus = await quizService.getWeeklyQuizStatusService(
      orgId,
      employeeId,
    );

    res.status(200).json(weeklyQuizStatus);
  } catch (error) {
    next(error);
  }
};

const getWeeklyQuizQuestions = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const weeklyQuizQuestions =
      await questionService.getWeeklyQuizQuestions(orgId);

    res.status(200).json(weeklyQuizQuestions);
  } catch (error) {
    next(error);
  }
};

const approveWeeklyQuizQuestions = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const { questions, questionsToDelete } = req.body;
    if (!orgId || !questions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await questionService.approveWeeklyQuizQuestions(
      questions,
      questionsToDelete,
      orgId,
    );

    res.status(200).json({ message: 'Questions marked as approved' });
  } catch (error) {
    next(error);
  }
};

const getScheduledQuizzes = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const scheduledQuizzes =
      await quizService.getScheduledQuizzesService(orgId);

    res.status(200).json(scheduledQuizzes);
  } catch (error) {
    next(error);
  }
};

const cancelLiveQuizController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await quizService.cancelLiveQuizService(quizId);

    res.status(200).json({ message: 'Live quiz cancelled' });
  } catch (error) {
    next(error);
  }
};

const handleLambdaCallback = async (req, res, next) => {
  try {
    const { category, quizId, file, questions, orgId } = req.body;
    if (!questions || !orgId || !category) {
      next(new Error('Invalid request body'));
      return;
    }

    await questionService.addLambdaCallbackQuestions(
      questions,
      category,
      orgId,
      quizId,
      file,
    );

    res.status(200).json({ message: 'Scheduled new questions' });
  } catch (error) {
    next(error);
  }
};

export default {
  getWeeklyQuizStatusController,
  getWeeklyQuizQuestions,
  getScheduledQuizzes,
  cancelLiveQuizController,
  approveWeeklyQuizQuestions,
  handleLambdaCallback,
};
