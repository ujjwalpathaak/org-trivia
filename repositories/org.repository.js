import { ObjectId } from 'mongodb';

import { HRP_QUESTIONS_PER_QUIZ } from '../constants.js';
import Org from '../models/org.model.js';
import Question from '../models/question.model.js';
import resultRepository from './result.repository.js';

const categoryMap = {
  PnA: 'questionsPnA',
  CAnIT: 'questionsCAnIT',
  HRD: 'questionsHRD',
};

const updateQuestionsStatusInOrgToUsed = async (
  orgId,
  category,
  questionIds,
  idsOfQuestionsToDelete,
) => {
  const questionField = categoryMap[category];
  if (!questionField) throw new Error('Invalid category');

  await Question.deleteMany({ _id: { $in: idsOfQuestionsToDelete } });
  await Org.updateMany(
    { _id: new ObjectId(orgId) },
    {
      $pull: {
        [questionField]: { questionId: { $in: idsOfQuestionsToDelete } },
      },
    },
  );

  return Org.updateMany(
    { _id: new ObjectId(orgId) },
    { $set: { [`${questionField}.$[elem].isUsed`]: true } },
    { arrayFilters: [{ 'elem.questionId': { $in: questionIds } }] },
  );
};

const addQuestionToOrg = async (question, orgId) => {
  const questionField = categoryMap[question.category];
  if (!questionField) throw new Error('Invalid question category');

  const result = await Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $push: {
        [questionField]: {
          questionId: question._id,
          isUsed: false,
          category: question.category,
          source: question.source,
        },
      },
    },
  );

  if (!result.matchedCount) throw new Error('Organization not found');
  return true;
};

const getTriviaEnabledOrgs = async () =>
  Org.find(
    { 'settings.isTriviaEnabled': true },
    {
      questionsCAnIT: 0,
      questionsHRD: 0,
      questionsPnA: 0,
    },
  );

const setNextQuestionGenre = async (orgId, currentGenreIndex) => {
  const org = await Org.findById(orgId).select('settings.selectedGenre');
  if (!org) throw new Error('Organization not found');

  const totalGenres = org.settings.selectedGenre.length;
  if (!totalGenres) throw new Error('No genres available');

  const nextIndex = (currentGenreIndex + 1) % totalGenres;
  await Org.updateOne(
    { _id: orgId },
    { $set: { 'settings.currentGenre': nextIndex } },
  );
  return true;
};

const changeCompanyCurrentAffairsTimeline = async (
  companyCurrentAffairsTimeline,
  orgId,
) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $set: {
        'settings.companyCurrentAffairsTimeline': companyCurrentAffairsTimeline,
      },
    },
  );
};

const updateNewUserInOrg = async (orgId, isAdmin, newUser) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $push: { [isAdmin ? 'admins' : 'employees']: newUser._id } },
  );
};

const changeGenreSettings = async (genre, orgId) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $set: { 'settings.selectedGenre': genre, 'settings.currentGenre': 0 } },
  );
};

const fetchHRDQuestions = async (orgId) => {
  const files_with_unused_questions = await Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: '$questionsHRD' },
    { $match: { 'questionsHRD.isUsed': false } },
    {
      $group: {
        _id: '$questionsHRD.file',
        questions: { $push: '$questionsHRD' },
      },
    },
  ]);

  if (files_with_unused_questions.length === 0) return [];

  // how many questions per file to take for HRD_QUESTIONS_PER_QUIZ number of questions
  const questions_per_file = Math.max(
    1,
    Math.floor(HRP_QUESTIONS_PER_QUIZ / files.length),
  );

  // return questions
  return Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: '$questionsHRD' },
    { $match: { 'questionsHRD.isUsed': false, 'questionsHRD.source': 'AI' } },
    {
      $group: {
        _id: '$questionsHRD.file',
        questions: { $push: '$questionsHRD' },
      },
    },
    {
      $project: {
        _id: 1,
        questions: { $slice: ['$questions', questions_per_file] },
      },
    },
    { $unwind: '$questions' },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions.questionId',
        foreignField: '_id',
        as: 'questionDetails',
      },
    },
    { $unwind: '$questionDetails' },
    { $replaceRoot: { newRoot: '$questionDetails' } },
  ]);
};

const HRPQuestionsCount = async (orgId) => {
  return Org.countDocuments({
    _id: new ObjectId(orgId),
    'questionsHRD.isUsed': false,
  });
};

const getSettings = async (orgId) => {
  const [count_hrd_questions] = await Promise.all([HRPQuestionsCount(orgId)]);

  const settings = await Org.findById(orgId).select('settings');

  return {
    settings: settings?.settings,
    question_count: {
      hrd_questions: count_hrd_questions,
      hrd_questions_required_per_quiz: HRP_QUESTIONS_PER_QUIZ,
    },
  };
};

const getAllOrgNames = async () => Org.find({}, 'id name');
const getOrgById = async (orgId) => Org.findById(orgId);
const isTriviaEnabled = async (orgId) =>
  Org.findById(orgId).select('settings.isTriviaEnabled');
const updateTriviaSettings = async (orgId, newStatus) => {
  const update = await Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $set: { 'settings.isTriviaEnabled': newStatus } },
  );
};

const makeGenreUnavailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $addToSet: { 'settings.unavailableGenre': genre },
      $pull: { 'settings.selectedGenre': genre },
    },
  );
};

const makeGenreAvailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $pull: { 'settings.unavailableGenre': genre },
      $addToSet: { 'settings.selectedGenre': genre },
    },
  );
};

const getAnalytics = async (orgId) => {
  const [participationByGenre, last3Leaderboards] = await Promise.all([
    resultRepository.getParticipationByGenre(orgId),
  ]);
  return { participationByGenre, last3Leaderboards };
};

const pushQuestionsInOrg = (questions, genre, orgId) => {
  return Org.updateMany(
    { _id: new ObjectId(orgId) },
    { $push: { [`questions${genre}`]: { $each: questions } } },
  );
};

const fetchExtraEmployeeQuestions = async (orgId, quizId, genre) => {
  const genreField = categoryMap[genre];

  return Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: `$${genreField}` },
    {
      $match: {
        [`${genreField}.isUsed`]: false,
        [`${genreField}.source`]: 'Employee',
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: `${genreField}.questionId`,
        foreignField: '_id',
        as: 'questionDetails',
      },
    },
    { $unwind: '$questionDetails' },
    { $replaceRoot: { newRoot: '$questionDetails' } },
  ]);
};

export default {
  updateQuestionsStatusInOrgToUsed,
  addQuestionToOrg,
  getTriviaEnabledOrgs,
  setNextQuestionGenre,
  updateNewUserInOrg,
  fetchHRDQuestions,
  changeGenreSettings,
  getSettings,
  fetchExtraEmployeeQuestions,
  getAllOrgNames,
  makeGenreUnavailable,
  makeGenreAvailable,
  pushQuestionsInOrg,
  getOrgById,
  HRPQuestionsCount,
  isTriviaEnabled,
  updateTriviaSettings,
  changeCompanyCurrentAffairsTimeline,
  getAnalytics,
};
