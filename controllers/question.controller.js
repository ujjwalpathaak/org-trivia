import {
  getWeeklyQuizQuestions,
  saveQuestion,
  scheduleQuizzesJob,
  validateEmployeeQuestionSubmission,
} from '../services/question.service.js';

export const createNewQuestionController = async (req, res, next) => {
  try {
    const question = req.body;
    const { employeeId } = req.data;
    const errors = await validateEmployeeQuestionSubmission(question);
    if (errors) {
      return res.status(400).json(errors);
    }

    const isQuestionAdded = await saveQuestion(question, employeeId);
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
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const weeklyQuizQuestions = await getWeeklyQuizQuestions(orgId, quizId);
    res.status(200).json(weeklyQuizQuestions);
  } catch (error) {
    next(error);
  }
};

export const handleLambdaCallbackController = async (req, res, next) => {
  try {
    const { category, quizId, file, questions, orgId, newsTimeline } = req.body;
    if (!questions || !orgId || !category) {
      next(new Error('Invalid request body'));
      return;
    }

    await addLambdaCallbackQuestions(
      questions,
      category,
      orgId,
      quizId,
      file,
      newsTimeline,
    );

    res.status(200).json({ message: 'Scheduled new questions' });
  } catch (error) {
    next(error);
  }
};

// test controller
export const generateCAnITQuestionsController = async (req, res, next) => {
  try {
    await generateCAnITQuestionsService();
    res.status(200).json({ message: 'CAnIT questions generated successfully' });
  } catch (error) {
    next(error);
  }
};

// test controller
export const scheduleQuizzesJobController = async (req, res, next) => {
  try {
    await scheduleQuizzesJob();
    res.status(200).json({ message: 'Quizzes Scheduled successfully' });
  } catch (error) {
    next(error);
  }
};