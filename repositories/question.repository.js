import Question from '../models/question.model.js';
import WeeklyQuestion from '../models/weeklyQuestion.model.js';
import orgRepository from './org.repository.js';
import quizRepository from './quiz.repository.js';

const saveQuestion = async (newQuestion) => {
  return await new Question(newQuestion).save();
};

const addQuestions = async (newQuestions) => {
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

const getApprovedWeeklyQuizQuestion = async (orgId) => {
  return await WeeklyQuestion.find({ orgId, isApproved: true })
    .select('-question.answer')
    .lean();
};

const dropWeeklyQuestionCollection = async () => {
  return await WeeklyQuestion.deleteMany();
};

const updateWeeklyQuestionsStatusToApproved = async (
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

const getCorrectWeeklyQuizAnswers = async (orgId) => {
  return await WeeklyQuestion.find({ orgId })
    .select('question._id question.answer')
    .lean();
};

const saveWeeklyQuizQuestions = async (quizId, newQuestions) => {
  if (newQuestions.length > 0) {
    await quizRepository.updateQuizStatus(quizId, 'unapproved');
    return await WeeklyQuestion.insertMany(newQuestions);
  }
  return [];
};

const getExtraEmployeeQuestions = async (orgId, quizId, genre) => {
  return await orgRepository.fetchExtraEmployeeQuestions(orgId, quizId, genre);
};

const getWeeklyUnapprovedQuestions = async (quizId) => {
  return await WeeklyQuestion.find({ quizId });
};

const fetchHRDQuestions = async (orgId) => {
  return await orgRepository.fetchHRDQuestions(orgId);
};

export default {
  saveQuestion,
  addQuestions,
  getApprovedWeeklyQuizQuestion,
  dropWeeklyQuestionCollection,
  updateWeeklyQuestionsStatusToApproved,
  getCorrectWeeklyQuizAnswers,
  saveWeeklyQuizQuestions,
  getExtraEmployeeQuestions,
  getWeeklyUnapprovedQuestions,
  fetchHRDQuestions,
};
