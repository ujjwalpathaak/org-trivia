import { generateCAnITQuestionsService } from '../services/question.service.js';
import {
  cleanUpWeeklyQuizService,
  makeWeeklyQuizLiveService,
} from '../services/quiz.service.js';

export const makeWeeklyQuizLiveController = async (req, res, next) => {
  try {
    await makeWeeklyQuizLiveService();
    res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

export const cleanUpWeeklyQuizController = async (req, res, next) => {
  try {
    await cleanUpWeeklyQuizService();
    res.status(200).json({ message: 'Weekly quiz cleaned successfully' });
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
