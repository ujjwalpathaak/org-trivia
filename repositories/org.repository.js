import { ObjectId } from 'mongodb';

import { HRP_QUESTIONS_PER_QUIZ } from '../constants.js';
import Org from '../models/org.model.js';
import { getParticipationByGenre } from './result.repository.js';

export const getTriviaEnabledOrgs = async () =>
  Org.find(
    {
      'settings.isTriviaEnabled': true,
      'settings.selectedGenre.0': { $exists: true },
    },
    {
      questionsCAnIT: 0,
      questionsHRP: 0,
      questionsPnA: 0,
    },
  );

const categoryMap = {
  PnA: 'questionsPnA',
  CAnIT: 'questionsCAnIT',
  HRP: 'questionsHRP',
};

export const pushNewQuestionInOrg = async (question, orgId) => {
  const questionField = categoryMap[question.category];
  if (!questionField) throw new Error('Invalid question category');

  const result = await Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $push: {
        [questionField]: {
          questionId: question._id,
          state: 0,
          category: question.category,
          source: question.source,
        },
      },
    },
  );

  if (!result.matchedCount) throw new Error('Organization not found');
  return true;
};

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

export const changeOrgQuestionsState = async (genre, orgId, state) => {
  const questionField = categoryMap[genre];
  return Org.updateOne(
    {
      _id: new ObjectId(orgId),
    },
    {
      $set: {
        [`${questionField}.$[].state`]: state,
      },
    },
  );
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

export const getOrgCAnITDropdownValue = async (orgIds) => {
  return Org.find({
    _id: { $in: orgIds },
  }).select('settings.companyCurrentAffairsTimeline');
};

export const fetchHRPQuestions = async (orgId) => {
  const files_with_unused_questions = await Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: '$questionsHRP' },
    { $match: { 'questionsHRP.state': 0 } },
    {
      $group: {
        _id: '$questionsHRP.file',
        questions: { $push: '$questionsHRP' },
      },
    },
  ]);

  if (files_with_unused_questions.length === 0) return [];

  const questions_per_file = Math.max(
    1,
    Math.floor(HRP_QUESTIONS_PER_QUIZ / files_with_unused_questions.length),
  );

  return Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: '$questionsHRP' },
    { $match: { 'questionsHRP.state': 0, 'questionsHRP.source': 'AI' } },
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

export const removeQuestionFromOrg = async (
  questionId,
  orgId,
  questionGenre,
) => {
  const questionArr = categoryMap[questionGenre];

  const orgQuestions = await Org.findOne({ _id: new ObjectId(orgId) }).select(
    questionArr,
  );

  const filteredQuestions = orgQuestions?.[questionArr]?.filter(
    (q) => q.questionId.toString() !== questionId,
  );

  return Org.updateOne(
    {
      _id: new ObjectId(orgId),
    },
    {
      $set: {
        [questionArr]: filteredQuestions,
      },
    },
  );
};

export const isGenreAvailable = async (orgId, genre) => {
  const org = await Org.findOne({
    _id: new ObjectId(orgId),
    'settings.unavailableGenre': { $in: [genre] },
  });

  return !org;
};

export const updateQuestionsStatus = async (orgId, idsToUpdate, genre) => {
  const arrayField = categoryMap[genre];

  return Org.updateMany({ _id: new ObjectId(orgId) }, [
    {
      $set: {
        [arrayField]: {
          $map: {
            input: `$${arrayField}`,
            as: 'item',
            in: {
              $cond: {
                if: { $in: ['$$item.questionId', idsToUpdate] },
                then: { $mergeObjects: ['$$item', { state: 1 }] },
                else: '$$item',
              },
            },
          },
        },
      },
    },
  ]);
};

// export const removeAllQuestionsPnAFromOrg = async (orgId) => {
//   const questionsToRemove = await Org.findById(orgId, 'questionsPnA');
//   await Org.updateOne(
//     { _id: new ObjectId(orgId) },
//     { $set: { questionsPnA: [] } },
//   );

//   return questionsToRemove.questionsPnA.map((q) => q.questionId);
// };

export const fetchPnAQuestions = async (orgId) => {
  return Org.aggregate([
    {
      $match: {
        _id: {
          $eq: new ObjectId(orgId),
        },
      },
    },
    {
      $unwind: {
        path: '$questionsPnA',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        'questionsPnA.state': 0,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$questionsPnA',
      },
    },
    {
      $group: {
        _id: '$puzzleType',
        questionId: {
          $first: '$questionId',
        },
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'questionObject',
      },
    },
    {
      $unwind: {
        path: '$questionObject',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$questionObject',
      },
    },
  ]);
};

export const getPnAQuestionsLeft = async (orgId) => {
  return Org.aggregate([
    {
      $match: {
        _id: new ObjectId(orgId),
        'questionsPnA.state': 0,
      },
    },
    {
      $project: {
        _id: 1,
        count: {
          $size: {
            $filter: {
              input: '$questionsPnA',
              as: 'q',
              cond: { $eq: ['$$q.state', 0] },
            },
          },
        },
      },
    },
  ]);
};

export const HRPQuestionsCount = async (orgId) => {
  const HRDquestions = await Org.aggregate([
    {
      $match: {
        _id: new ObjectId(orgId),
        'questionsHRP.state': 0,
      },
    },
    {
      $project: {
        _id: 1,
        count: {
          $size: {
            $filter: {
              input: '$questionsHRP',
              as: 'q',
              cond: { $eq: ['$$q.state', 0] },
            },
          },
        },
      },
    },
  ]);
  return HRDquestions[0]?.count;
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
    [`${questionField}.isUsed`]: false,
  });
};

export const changeQuestionsState = async (
  idsToAdd,
  idsToRemove,
  orgId,
  genre,
) => {
  const questionField = categoryMap[genre];

  const operations = [
    ...idsToAdd.map((id) => ({
      updateOne: {
        filter: {
          _id: new ObjectId(orgId),
          [`${questionField}.questionId`]: new ObjectId(id),
        },
        update: { $set: { [`${questionField}.$.state`]: 1 } },
      },
    })),
    ...idsToRemove.map((id) => ({
      updateOne: {
        filter: {
          _id: new ObjectId(orgId),
          [`${questionField}.questionId`]: new ObjectId(id),
        },
        update: { $set: { [`${questionField}.$.state`]: 0 } },
      },
    })),
  ];

  return Org.bulkWrite(operations);
};

export const makeGenreUnavailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $pull: { 'settings.selectedGenre': genre },
      $addToSet: { 'settings.unavailableGenre': genre },
    },
  );
};

export const makeGenreAvailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    {
      $pull: { 'settings.unavailableGenre': genre },
      $addToSet: { 'settings.selectedGenre': genre },
    },
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
            questionId: question.questionId,
            state: 0,
            category: genre,
            source: 'AI',
            ...(question.puzzleType && { puzzleType: question.puzzleType }),
            ...(question.file && { file: question.file }),
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
        [`${genreField}.state`]: 0,
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

export const fetchExtraAIQuestions = async (orgId, genre) => {
  const genreField = categoryMap[genre];

  return Org.aggregate([
    { $match: { _id: new ObjectId(orgId) } },
    { $unwind: `$${genreField}` },
    {
      $match: {
        [`${genreField}.state`]: 0,
        [`${genreField}.source`]: 'AI',
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
