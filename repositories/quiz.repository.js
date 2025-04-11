import { ObjectId } from 'mongodb';

import Quiz from '../models/quiz.model.js';
import { findResultByQuizId } from './result.repository.js';

/**
 * Finds a live quiz for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object|null>} The live quiz document or null if not found
 */
export const findLiveQuizByOrgId = (orgId) => {
  return Quiz.findOne({ orgId: new ObjectId(orgId), status: 'live' });
};

/**
 * Finds a quiz by its ID
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object|null>} The quiz document or null if not found
 */
export const findQuiz = (quizId) => {
  return Quiz.findOne({ _id: new ObjectId(quizId) });
};

/**
 * Gets live quiz questions for a specific organization
 * @returns {Promise<Array<Object>>} Array of quiz questions with quiz ID
 */
export const getLiveQuizQuestionsByOrgId = () => {
  return Quiz.aggregate([
    {
      $match: {
        orgId: new ObjectId('67c6904cf8c3ce19ef544cac'),
        status: 'live',
      },
    },
    {
      $lookup: {
        from: 'weeklyquestions',
        localField: '_id',
        foreignField: 'quizId',
        as: 'questions',
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $replaceRoot: {
        newRoot: '$questions',
      },
    },
    {
      $unwind: {
        path: '$questions',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questions',
        foreignField: '_id',
        as: 'question',
      },
    },
    {
      $unwind: {
        path: '$question',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        'question.quizId': '$quizId',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$question',
      },
    },
  ]);
};

/**
 * Gets the status of a quiz for an organization on a specific date
 * @param {string} orgId - The ID of the organization
 * @param {Date} date - The date to check
 * @returns {Promise<Object|null>} Quiz status and genre or null if not found
 */
export const getQuizStatus = (orgId, date) => {
  return Quiz.findOne(
    {
      orgId: new ObjectId(orgId),
      scheduledDate: date,
    },
    { genre: 1, status: 1, _id: 0 },
  );
};

/**
 * Cancels a scheduled quiz
 * @param {string} quizId - The ID of the quiz to cancel
 * @returns {Promise<Object|null>} The updated quiz document or null if not found
 */
export const cancelScheduledQuiz = async (quizId) => {
  return Quiz.findOneAndUpdate(
    { _id: new ObjectId(quizId) },
    { $set: { status: 'cancelled' } },
    { returnDocument: 'after' },
  );
};

/**
 * Cancels a live quiz
 * @param {string} quizId - The ID of the quiz to cancel
 * @returns {Promise<Object|null>} The updated quiz document or null if not found
 */
export const cancelLiveQuiz = async (quizId) => {
  return Quiz.findOneAndUpdate(
    { _id: new ObjectId(quizId), status: 'live' },
    { $set: { status: 'expired' } },
    { returnDocument: 'after' },
  );
};

/**
 * Allows a previously cancelled quiz to be scheduled
 * @param {string} quizId - The ID of the quiz to allow
 * @returns {Promise<Object>} Result of the update operation
 */
export const allowScheduledQuiz = async (quizId) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'cancelled' },
    { $set: { status: 'scheduled' } },
  );
};

/**
 * Gets scheduled quizzes for an organization within a date range
 * @param {string} orgId - The ID of the organization
 * @param {Date} startDate - Start of the date range
 * @param {Date} endDate - End of the date range
 * @returns {Promise<Array<Object>>} Array of scheduled quiz documents
 */
export const getScheduledQuizzes = (orgId, startDate, endDate) => {
  return Quiz.find({
    orgId: new ObjectId(orgId),
    scheduledDate: { $gte: startDate, $lte: endDate },
  }).sort({
    scheduledDate: 1,
  });
};

/**
 * Gets the last quiz by genre for each organization
 * @returns {Promise<Array<Object>>} Array of last quiz information by organization
 */
export const lastQuizByGenre = () => {
  return Quiz.aggregate([
    {
      $match: { genre: 'CAnIT', status: 'expired' },
    },
    {
      $sort: {
        scheduledDate: -1,
      },
    },
    {
      $group: {
        _id: '$orgId',
        scheduledDate: {
          $first: '$scheduledDate',
        },
        quizId: {
          $first: '$_id',
        },
      },
    },
    {
      $project: {
        orgId: '$_id',
        scheduledDate: 1,
        quizId: 1,
        _id: 0,
      },
    },
  ]);
};

/**
 * Gets the next scheduled CAnIT quizzes (development)
 * @returns {Promise<Array<Object>>} Array of next scheduled CAnIT quizzes
 */
export const getCAnITQuizzesScheduledNext = () => {
  return Quiz.aggregate([
    {
      $match: {
        genre: 'CAnIT',
        status: 'upcoming',
      },
    },
    {
      $sort: {
        scheduledDate: 1,
      },
    },
    {
      $group: {
        _id: '$orgId',
        scheduledDate: { $first: '$scheduledDate' },
        quizId: { $first: '$_id' },
      },
    },
    {
      $project: {
        orgId: '$_id',
        scheduledDate: 1,
        quizId: 1,
        _id: 0,
      },
    },
  ]);
};

/**
 * Gets CAnIT quizzes scheduled for tomorrow (production)
 * @returns {Promise<Array<Object>>} Array of tomorrow's scheduled CAnIT quizzes
 */
export const getCAnITQuizzesScheduledTomm = () => {
  const today = new Date();

  const todayInUTCFormat = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return Quiz.find({
    genre: 'CAnIT',
    status: 'upcoming',
    questionGenerationDate: todayInUTCFormat,
  });
};

/**
 * Schedules a new weekly quiz
 * @param {string} orgId - The ID of the organization
 * @param {Date} date - The date to schedule the quiz
 * @param {string} genre - The genre of the quiz
 * @returns {Promise<Object>} The created quiz document
 */
export const scheduleNewWeeklyQuiz = (orgId, date, genre) => {
  return Quiz.create({
    orgId,
    status: 'upcoming',
    scheduledDate: date,
    genre,
  });
};

/**
 * Makes quizzes live for a specific date
 * @param {Date} date - The date to make quizzes live
 * @returns {Promise<Object>} Result of the bulk write operation
 */
export const makeQuizLive = async (date) => {
  return Quiz.bulkWrite([
    {
      updateMany: {
        filter: {
          status: 'upcoming',
          scheduledDate: date,
        },
        update: { $set: { status: 'cancelled' } },
      },
    },
    {
      updateMany: {
        filter: {
          status: 'scheduled',
          scheduledDate: date,
        },
        update: { $set: { status: 'live' } },
      },
    },
  ]);
};

/**
 * Marks all live quizzes as expired
 * @returns {Promise<Array<string>>} Array of quiz IDs that were marked as expired
 */
export const markAllLiveQuizAsExpired = async () => {
  const liveQuizzes = await Quiz.find({ status: 'live' }, { _id: 1 }).lean();
  const quizIds = liveQuizzes.map((q) => q._id);

  await Quiz.updateMany(
    { _id: { $in: quizIds } },
    { $set: { status: 'expired' } },
  );

  return quizIds;
};

/**
 * Gets the upcoming weekly quiz for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object|null>} The upcoming quiz document or null if not found
 */
export const getUpcomingWeeklyQuiz = (orgId) => {
  return Quiz.findOne({
    orgId: new ObjectId(orgId),
    status: 'unapproved',
  });
};

/**
 * Updates the status of a quiz
 * @param {string} quizId - The ID of the quiz
 * @param {string} status - The new status to set
 * @returns {Promise<Object>} Result of the update operation
 */
export const updateQuizStatus = (quizId, status) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId) },
    {
      $set: {
        status: status,
      },
    },
  );
};

/**
 * Gets a live quiz for an employee
 * @param {string} employeeId - The ID of the employee
 * @returns {Promise<Object|null>} The live quiz document or null if not found
 */
export const getLiveQuizByEmployeeId = async (employeeId) => {
  const result = await findResultByQuizId(employeeId);
  return result?.quizId;
};

/**
 * Gets a quiz by its ID
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object|null>} The quiz document or null if not found
 */
export const getQuizByQuizId = (quizId) => {
  return Quiz.findOne({ _id: new ObjectId(quizId) });
};

/**
 * Changes the genre of a quiz
 * @param {string} newGenre - The new genre to set
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Result of the update operation
 */
export const changeQuizGenre = async (newGenre, quizId) => {
  return Quiz.updateOne(
    { _id: new ObjectId(quizId), status: 'upcoming' },
    { $set: { genre: newGenre } },
  );
};
