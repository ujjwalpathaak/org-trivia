import { ObjectId } from 'mongodb';

import { HRP_QUESTIONS_PER_QUIZ } from '../constants.js';
import Org from '../models/org.model.js';
import Question from '../models/question.model.js';
import {
  findResultByQuizId,
  getParticipationByGenre,
} from './result.repository.js';

const categoryMap = {
  PnA: 'questionsPnA',
  CAnIT: 'questionsCAnIT',
  HRP: 'questionsHRP',
};

export const updateQuestionsStatusInOrgToUsed = async (
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

export const addQuestionToOrg = async (question, orgId) => {
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

export const getTriviaEnabledOrgs = async () =>
  Org.find(
    { 'settings.isTriviaEnabled': true },
    {
      questionsCAnIT: 0,
      questionsHRP: 0,
      questionsPnA: 0,
    },
  );

export const setNextQuestionGenre = async (orgId, currentGenreIndex) => {
  const org = await Org.findById(orgId).select('settings.selectedGenre');
  if (!org) throw new Error('Organization not found');

  const totalGenres = org.settings.selectedGenre.length;
  if (!totalGenres) throw new Error('No genres available');

  const nextIndex = currentGenreIndex % totalGenres;
  await Org.updateOne(
    { _id: orgId },
    { $set: { 'settings.currentGenre': nextIndex } },
  );
  return true;
};

export const changeCompanyCurrentAffairsTimeline = async (
  orgId,
  companyCurrentAffairsTimeline,
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

export const updateNewUserInOrg = async (orgId, isAdmin, newUser) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $push: { [isAdmin ? 'admins' : 'employees']: newUser._id } },
  );
};

export const changeGenreSettings = async (genre, orgId) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $set: { 'settings.selectedGenre': genre, 'settings.currentGenre': 0 } },
  );
};

export const fetchHRPQuestions = async (orgId) => {
  const files_with_unused_questions = await Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: '$questionsHRP' },
    { $match: { 'questionsHRP.isUsed': false } },
    {
      $group: {
        _id: '$questionsHRP.file',
        questions: { $push: '$questionsHRP' },
      },
    },
  ]);

  if (files_with_unused_questions.length === 0) return [];

  // how many questions per file to take for HRP_QUESTIONS_PER_QUIZ number of questions
  const questions_per_file = Math.max(
    1,
    Math.floor(HRP_QUESTIONS_PER_QUIZ / files_with_unused_questions.length),
  );

  // return questions
  return Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: '$questionsHRP' },
    { $match: { 'questionsHRP.isUsed': false, 'questionsHRP.source': 'AI' } },
    {
      $group: {
        _id: '$questionsHRP.file',
        questions: { $push: '$questionsHRP' },
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

export const HRPQuestionsCount = async (orgId) => {
  return Org.countDocuments({
    _id: new ObjectId(orgId),
    'questionsHRP.isUsed': false,
  });
};

export const getOrgSettings = async (orgId) => {
  const [count_hrp_questions] = await Promise.all([HRPQuestionsCount(orgId)]);

  const settings = await Org.findById(orgId).select('settings');

  return {
    settings: settings?.settings,
    question_count: {
      hrp_questions: count_hrp_questions,
      hrp_questions_required_per_quiz: HRP_QUESTIONS_PER_QUIZ,
    },
  };
};

export const getAllOrgNames = async () => Org.find({}, 'id name');
export const getOrgById = async (orgId) => Org.findById(orgId);
export const isTriviaEnabled = async (orgId) =>
  Org.findById(orgId).select('settings.isTriviaEnabled');
export const toggleTrivia = async (orgId, newStatus) => {
  await Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $set: { 'settings.isTriviaEnabled': newStatus } },
  );
};

export const getExtraQuestionsCount = async (orgId, genre) => {
  const questionField = categoryMap[genre];
  if (!questionField) throw new Error('Invalid genre');

  return Org.countDocuments({
    _id: new ObjectId(orgId),
    [`${questionField}.isUsed`]: false
  });
}

export const makeGenreUnavailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $pull: { 'settings.selectedGenre': genre } },
    { $addToSet: { 'settings.unavailableGenres': genre } },
  );
};

export const makeGenreAvailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $addToSet: { 'settings.selectedGenre': genre } },
    { $pull: { 'settings.unavailableGenres': genre } },
  );
};

export const getOrgAnalytics = async (orgId) => {
  const [participationByGenre] = await Promise.all([
    getParticipationByGenre(orgId),
  ]);
  return { participationByGenre };
};

export const pushQuestionsInOrg = (questions, genre, orgId) => {
  const questionField = categoryMap[genre];
  if (!questionField) throw new Error('Invalid genre');

  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $push: {
        [questionField]: {
          $each: questions.map((question) => ({
            questionId: question._id,
            isUsed: false,
            category: genre,
            source: question.source,
          })),
        },
      },
    },
  );
};

export const fetchExtraEmployeeQuestions = async (orgId, genre) => {
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

// isko theek karna hai

export const fetchExtraAIQuestions = async (orgId, genre) => {
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
