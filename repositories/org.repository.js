import { ObjectId } from 'mongodb';

import { HRP_QUESTIONS_PER_QUIZ } from '../constants.js';
import Org from '../models/org.model.js';
import { getParticipationByGenre } from './result.repository.js';

/**
 * Gets all organizations that have trivia enabled
 * @returns {Promise<Array<Object>>} Array of organizations with trivia enabled
 */
export const getTriviaEnabledOrgs = async () =>
  Org.find(
    { 'settings.isTriviaEnabled': true },
    {
      questionsCAnIT: 0,
      questionsHRP: 0,
      questionsPnA: 0,
    },
  );

/**
 * Maps question categories to their corresponding field names in the organization document
 * @type {Object.<string, string>}
 */
const categoryMap = {
  PnA: 'questionsPnA',
  CAnIT: 'questionsCAnIT',
  HRP: 'questionsHRP',
};

/**
 * Adds a new question to an organization's question pool
 * @param {Object} question - The question object to add
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If category is invalid or organization not found
 */
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

/**
 * Sets the next question genre for an organization
 * @param {string} orgId - The ID of the organization
 * @param {number} currentGenreIndex - The current genre index
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If organization not found or no genres available
 */
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

/**
 * Changes the state of all questions of a specific genre for an organization
 * @param {string} genre - The genre of questions to update
 * @param {string} orgId - The ID of the organization
 * @param {number} state - The new state to set
 * @returns {Promise<Object>} Result of the update operation
 */
export const changeOrgQuestionsState = async (genre, orgId, state) => {
  const questionField = categoryMap[genre];
  return Org.update(
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

/**
 * Updates the company current affairs timeline setting
 * @param {string} orgId - The ID of the organization
 * @param {string} companyCurrentAffairsTimeline - The new timeline value
 * @returns {Promise<Object>} Result of the update operation
 */
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

/**
 * Adds a new user to an organization
 * @param {string} orgId - The ID of the organization
 * @param {boolean} isAdmin - Whether the user is an admin
 * @param {Object} newUser - The user object to add
 * @returns {Promise<Object>} Result of the update operation
 */
export const updateNewUserInOrg = async (orgId, isAdmin, newUser) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $push: { [isAdmin ? 'admins' : 'employees']: newUser._id } },
  );
};

/**
 * Updates the genre settings for an organization
 * @param {Array<string>} genre - Array of genres to set
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Result of the update operation
 */
export const changeGenreSettings = async (genre, orgId) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $set: { 'settings.selectedGenre': genre, 'settings.currentGenre': 0 } },
  );
};

/**
 * Gets CAnIT dropdown values for organizations
 * @param {Array<string>} orgIds - Array of organization IDs
 * @returns {Promise<Array<Object>>} Array of organizations with CAnIT timeline settings
 */
export const getOrgCAnITDropdownValue = async (orgIds) => {
  return Org.find({
    _id: { $in: orgIds },
  }).select('settings.companyCurrentAffairsTimeline');
};

/**
 * Fetches HRP questions for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Array<Object>>} Array of HRP questions
 */
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

/**
 * Checks if a genre is available for an organization
 * @param {string} orgId - The ID of the organization
 * @param {string} genre - The genre to check
 * @returns {Promise<boolean>} True if genre is available
 */
export const isGenreAvailable = async (orgId, genre) => {
  const org = await Org.findOne({
    _id: new ObjectId(orgId),
    'settings.unavailableGenre': { $in: [genre] },
  });

  return !org;
};

/**
 * Updates the status of questions in an organization
 * @param {string} orgId - The ID of the organization
 * @param {Array<string>} idsToUpdate - Array of question IDs to update
 * @param {string} genre - The genre of questions to update
 * @returns {Promise<Object>} Result of the update operation
 */
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

/**
 * Fetches PnA questions for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Array<Object>>} Array of PnA questions
 */
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

/**
 * Gets the count of remaining PnA questions
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<number>} Count of remaining PnA questions
 */
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

/**
 * Gets the count of HRP questions
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<number>} Count of HRP questions
 */
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

/**
 * Gets organization settings
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Organization settings
 */
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

/**
 * Gets all organization names
 * @returns {Promise<Array<Object>>} Array of organizations with their names
 */
export const getAllOrgNames = async () => Org.find({}, 'id name');

/**
 * Gets an organization by ID
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object|null>} Organization document or null if not found
 */
export const getOrgById = async (orgId) => Org.findById(orgId);

/**
 * Checks if trivia is enabled for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object|null>} Organization document with trivia setting or null if not found
 */
export const isTriviaEnabled = async (orgId) =>
  Org.findById(orgId).select('settings.isTriviaEnabled');

/**
 * Toggles trivia for an organization
 * @param {string} orgId - The ID of the organization
 * @param {boolean} newStatus - The new trivia status
 * @returns {Promise<Object>} Result of the update operation
 */
export const toggleTrivia = async (orgId, newStatus) => {
  await Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $set: { 'settings.isTriviaEnabled': newStatus } },
  );
};

/**
 * Gets the count of extra questions for a genre
 * @param {string} orgId - The ID of the organization
 * @param {string} genre - The genre to check
 * @returns {Promise<number>} Count of extra questions
 */
export const getExtraQuestionsCount = async (orgId, genre) => {
  const questionField = categoryMap[genre];
  if (!questionField) throw new Error('Invalid genre');

  return Org.countDocuments({
    _id: new ObjectId(orgId),
    [`${questionField}.isUsed`]: false,
  });
};

/**
 * Changes the state of questions in an organization
 * @param {Array<string>} idsToAdd - Array of question IDs to add
 * @param {Array<string>} idsToRemove - Array of question IDs to remove
 * @param {string} orgId - The ID of the organization
 * @param {string} genre - The genre of questions to update
 * @returns {Promise<Object>} Result of the update operation
 */
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

/**
 * Makes a genre unavailable for an organization
 * @param {string} orgId - The ID of the organization
 * @param {string} genre - The genre to make unavailable
 * @returns {Promise<Object>} Result of the update operation
 */
export const makeGenreUnavailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $pull: { 'settings.selectedGenre': genre } },
    { $addToSet: { 'settings.unavailableGenres': genre } },
  );
};

/**
 * Makes a genre available for an organization
 * @param {string} orgId - The ID of the organization
 * @param {string} genre - The genre to make available
 * @returns {Promise<Object>} Result of the update operation
 */
export const makeGenreAvailable = async (orgId, genre) => {
  return Org.updateOne(
    { _id: new ObjectId(orgId) },
    { $addToSet: { 'settings.selectedGenre': genre } },
    { $pull: { 'settings.unavailableGenres': genre } },
  );
};

/**
 * Gets analytics for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Organization analytics
 */
export const getOrgAnalytics = async (orgId) => {
  const [participationByGenre] = await Promise.all([
    getParticipationByGenre(orgId),
  ]);
  return { participationByGenre };
};

/**
 * Adds multiple questions to an organization
 * @param {Array<Object>} questions - Array of questions to add
 * @param {string} genre - The genre of the questions
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Result of the update operation
 */
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

/**
 * Fetches extra employee questions for an organization
 * @param {string} orgId - The ID of the organization
 * @param {string} genre - The genre of questions to fetch
 * @returns {Promise<Array<Object>>} Array of extra employee questions
 */
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

/**
 * Fetches extra AI questions for an organization
 * @param {string} orgId - The ID of the organization
 * @param {string} genre - The genre of questions to fetch
 * @returns {Promise<Array<Object>>} Array of extra AI questions
 */
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
