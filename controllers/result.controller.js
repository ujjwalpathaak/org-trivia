import resultService from '../services/result.service.js';

const submitWeeklyQuizAnswers = async (req, res, next) => {
  try {
    const { answers, employeeId, orgId, quizId } = req.body;
    if (!answers || !employeeId || !orgId || !quizId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const data = await resultService.submitWeeklyQuizAnswers(
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

const getEmployeePastResults = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page = 0, size = 10 } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const pastRecords = await resultService.getEmployeePastResults(
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
  submitWeeklyQuizAnswers,
  getEmployeePastResults,
};
