import { validateEmployeeQuestionSubmission } from '../middleware/utils.js';
import {
  addNewHRPQuestionsCallbackService,
  approveEmployeeQuestionsService,
  createNewQuestionService,
  editQuizQuestionsService,
  generateCAnITQuestionsService,
  generateNewHRPQuestionsCallbackService,
  getEmployeesQuestionsToApproveService,
  getWeeklyQuizQuestions,
  rejectEmployeeQuestionsService,
  scheduleNextMonthQuizzesJob,
} from '../services/question.service.js';

export const editQuizQuestionsController = async (req, res, next) => {
  try {
    const { questions, replaceQuestions, quizId } = req.body;
    if (!quizId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await editQuizQuestionsService(questions, replaceQuestions, quizId);

    res.status(200).json({ message: 'Questions marked as approved' });
  } catch (error) {
    next(error);
  }
};

export const createNewQuestionController = async (req, res, next) => {
  try {
    const question = req.body;
    const { employeeId } = req.data;
    const errors = validateEmployeeQuestionSubmission(question);
    if (errors) {
      return res.status(400).json(errors);
    }

    const isQuestionAdded = await createNewQuestionService(
      question,
      employeeId,
    );
    if (!isQuestionAdded) {
      return res.status(404).json({ message: 'Not able to save question' });
    }

    res.status(200).json({ message: 'Question added successfully' });
  } catch (error) {
    next(error);
  }
};

export const getScheduledQuizQuestionsController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { orgId } = req.data;
    if (!quizId) {
      return res.status(400).json({ message: 'Missing quizId' });
    }
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const weeklyQuizQuestions = await getWeeklyQuizQuestions(orgId, quizId);
    res.status(200).json(weeklyQuizQuestions);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeQuestionsToApproveController = async (
  req,
  res,
  next,
) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const employeeQuestions =
      await getEmployeesQuestionsToApproveService(orgId);
    res.status(200).json(employeeQuestions);
  } catch (error) {
    next(error);
  }
};

export const rejectEmployeeQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const selectedQuestions = req.body;

    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const employeeQuestions =
      await rejectEmployeeQuestionsService(selectedQuestions);
    res.status(200).json(employeeQuestions);
  } catch (error) {
    next(error);
  }
};

export const approveEmployeeQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const selectedQuestions = req.body;

    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const employeeQuestions =
      await approveEmployeeQuestionsService(selectedQuestions);
    res.status(200).json(employeeQuestions);
  } catch (error) {
    next(error);
  }
};

export const addNewHRPQuestionsCallbackController = async (req, res, next) => {
  try {
    const { file, questions, orgId } = req.body;

    if (!questions || !orgId) {
      next(new Error('Invalid request body'));
      return;
    }

    await addNewHRPQuestionsCallbackService(questions, orgId, file);

    res.status(200).json({ message: 'Scheduled new questions' });
  } catch (error) {
    next(error);
  }
};

export const generateNewHRPQuestionsCallbackController = async (
  req,
  res,
  next,
) => {
  try {
    const { fileName } = req.body;
    const { orgId } = req.data;
    if (!fileName) {
      next(new Error('Invalid request body'));
      return;
    }

    await generateNewHRPQuestionsCallbackService(fileName, orgId);

    res.status(200).json({ message: 'Scheduled new questions' });
  } catch (error) {
    next(error);
  }
};

export const generateCAnITQuestionsController = async (req, res, next) => {
  try {
    await generateCAnITQuestionsService();
    res.status(200).json({ message: 'CAnIT questions generated successfully' });
  } catch (error) {
    next(error);
  }
};

export const scheduleQuizzesJobController = async (req, res, next) => {
  try {
    const response = await scheduleNextMonthQuizzesJob();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
