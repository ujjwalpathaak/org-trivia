import {
  getEmployeePastResultsService,
  submitWeeklyQuizAnswersService,
} from '../services/result.service.js';

export const submitQuizAnswersController = async (req, res, next) => {
  try {
    const { answers, quizId } = req.body;
    const { employeeId, orgId } = req.data;
    if (!answers || !employeeId || !orgId || !quizId) {
      return res.status(400).json({ message: 'Required fields not present' });
    }

    const data = await submitWeeklyQuizAnswersService(
      answers,
      employeeId,
      orgId,
      quizId,
    );

    if (!data.success) {
      return res.status(400).json({
        message: data.message,
      });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};