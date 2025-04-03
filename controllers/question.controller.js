import {
  getWeeklyQuizQuestions,
  saveQuestion,
  validateEmployeeQuestionSubmission,
} from '../services/question.service.js';

export const addQuestionController = async (req, res, next) => {
  try {
    const { question } = req.body;
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

export const getWeeklyQuizQuestionsController = async (req, res, next) => {
  try {
    const {quizId} = req.params;
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

// export const approveWeeklyQuizQuestionsController = async (req, res, next) => {
//   try {
//     const { orgId } = req.data;
//     const { questions, questionsToDelete } = req.body;
//     if (!orgId || !questions) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     await approveWeeklyQuizQuestionsService(
//       questions,
//       questionsToDelete,
//       orgId,
//     );
//     res.status(200).json({ message: 'Questions marked as approved' });
//   } catch (error) {
//     next(error);
//   }
// };
