import { ObjectId } from 'mongodb';

import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import { fetchExtraEmployeeQuestions } from './org.repository.js';
import { updateQuizStatus } from './quiz.repository.js';

export const saveQuestion = async (newQuestion) => {
  return await new Question(newQuestion).save();
};

export const getUnusedQuestionsFromTimeline = async (orgId, isApproved) => {
  const questions = await WeeklyQuestion.find({ orgId, isApproved })
    .select('question._id')
    .lean();

  return questions.map((q) => q.question._id);
}

export const addQuestions = async (newQuestions) => {
  const existingQuestions = await Question.find(
    { question: { $in: newQuestions.map((q) => q.question) } },
    { question: 1, _id: 0 },
  );

  const existingQuestionSet = new Set(existingQuestions.map((q) => q.question));
  const filteredQuestions = newQuestions.filter(
    (q) => !existingQuestionSet.has(q.question),
  );

  if (filteredQuestions.length === 0) {
    return [];
  }

  return await Question.insertMany(filteredQuestions, { ordered: false });
};

export const getWeeklyQuizScheduledQuestions = async (orgId) => {
  return await WeeklyQuestion.find({ orgId }).lean();
};

export const getWeeklyQuizLiveQuestions = async (orgId) => {
  // only if quiz is live
  return await WeeklyQuestion.find({ orgId })
    .select('-question.answer')
    .lean();
};

export const dropWeeklyQuestionCollection = async () => {
  return await WeeklyQuestion.deleteMany();
};

export const updateWeeklyQuestionsStatusToApproved = async (
  ids,
  employeeQuestionsToAdd,
  idsOfQuestionsToDelete,
) => {
  await WeeklyQuestion.deleteMany({
    'question._id': { $in: idsOfQuestionsToDelete },
  });
  await WeeklyQuestion.insertMany(employeeQuestionsToAdd);
  return await WeeklyQuestion.updateMany(
    { 'question._id': { $in: ids } },
    { $set: { isApproved: true } },
    { multi: true },
  );
};

export const getCorrectWeeklyQuizAnswers = async (orgId) => {
  return await WeeklyQuestion.find({ orgId })
    .select('question._id question.answer')
    .lean();
};

export const saveWeeklyQuizQuestions = async (quizId, newQuestions) => {
  if (newQuestions.length > 0) {
    await updateQuizStatus(quizId, 'scheduled');
    return await WeeklyQuestion.insertMany(newQuestions);
  }
  return [];
};

export const getWeeklyQuestions = async (quizId) => {
  return await WeeklyQuestion.find({ quizId: new ObjectId(quizId) });
};
