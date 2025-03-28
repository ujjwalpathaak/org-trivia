import resultService from '../services/result.service.js';

const submitWeeklyQuizAnswersController = async (req, res, next) => {
  try {
    const { answers, quizId } = req.body;
    const { employeeId, orgId } = req.data;
    if (!answers || !employeeId || !orgId || !quizId) {
      return res.status(400).json({ message: 'Required fields not present' });
    }

    const data = await resultService.submitWeeklyQuizAnswersService(
      answers,
      employeeId,
      orgId,
      quizId,
    );

    if (!data.success) {
      return res.status(400).json({
        message: data.message,
        data: null,
      });
    }

    res.status(200).json({
      message: 'Submitted weekly quiz answers',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const getEmployeePastResultsController = async (req, res, next) => {
  try {
    const { employeeId } = req.data;
    const { page = 0, size = 10 } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const pastRecords = await resultService.getEmployeePastResultsService(
      employeeId,
      page,
      size,
    );

    res.status(200).json(pastRecords);
  } catch (err) {
    next(err);
  }
};

export default {
  submitWeeklyQuizAnswersController,
  getEmployeePastResultsController,
};
