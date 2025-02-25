import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionService = new QuestionService(new QuestionRepository());

export const addQuestions = async (request, response) => {
  try {
    const question = request.body;
    const newQues = await questionService.saveQuestion(question);
    response.status(200).json({ newQues });
  } catch (err) {
    response.status(500).json({ message: 'server error', error: err });
  }
};

export const handleLambdaCallback = async (request, response) => {
  try {
    const data = request.body;
    const { weeklyQuestions, orgId } =
      await questionService.formatWeeklyQuestions(data);
    await questionService.saveWeeklyQuestions(weeklyQuestions);

    response.status(200).json({ message: 'Scheduled new questions' });
  } catch (err) {
    response.status(500).json({ message: 'server error', error: err });
  }
};
export const getWeeklyUnapprovedQuestions = async (request, response) => {
  try {
    const { orgId } = request.params;
    const questions = await questionService.getWeeklyUnapprovedQuestions(orgId);

    response.status(200).json({ questions: questions });
  } catch (err) {
    response.status(500).json({ message: 'server error', error: err });
  }
};
