import { ObjectId } from 'mongodb';

import Result from '../models/result.model.js';

/**
 * Submits a weekly quiz result for an employee
 * @param {string} employeeId - The ID of the employee who took the quiz
 * @param {string} orgId - The ID of the organization
 * @param {string} quizId - The ID of the quiz taken
 * @param {number} score - The score achieved in the quiz
 * @param {number} points - The points earned from the quiz
 * @param {string} genre - The genre/category of the quiz
 * @param {Array} answers - Array of answers submitted by the employee
 * @param {Object} session - MongoDB session for transaction support
 * @returns {Promise<Array>} Created result document
 */
export const submitWeeklyQuizAnswers = async (
  employeeId,
  orgId,
  quizId,
  score,
  points,
  genre,
  answers,
  session,
) => {
  const resultDoc = {
    employeeId,
    orgId,
    quizId,
    score,
    points,
    genre,
    answers,
  };

  return await Result.create([resultDoc], { session });
};

/**
 * Rolls back scores for a specific quiz by deleting results and updating employee scores
 * @param {string} quizId - The ID of the quiz to rollback
 * @returns {Promise<Object>} Result of the deletion operation
 */
export const rollbackWeeklyQuizScores = async (quizId) => {
  await Result.aggregate([
    {
      $match: {
        quizId: new ObjectId(quizId),
      },
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    {
      $unwind: {
        path: '$employee',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: {
        'employee.score': {
          $subtract: [
            { $ifNull: ['$employee.score', 0] },
            { $ifNull: ['$score', 0] },
          ],
        },
      },
    },
    {
      $replaceRoot: { newRoot: '$employee' },
    },
    {
      $merge: {
        into: 'employees',
        on: '_id',
        whenMatched: 'merge',
        whenNotMatched: 'discard',
      },
    },
  ]);

  return await Result.deleteMany({ quizId: new ObjectId(quizId) });
};

/**
 * Gets participation statistics grouped by quiz genre for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Array>} Array of participation counts by genre
 */
export const getParticipationByGenre = async (orgId) => {
  return await Result.aggregate([
    { $match: { orgId: new ObjectId(orgId) } },
    {
      $group: {
        _id: '$genre',
        count: { $sum: 1 },
      },
    },
  ]);
};

/**
 * Finds a result document by quiz ID
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object|null>} Result document if found, null otherwise
 */
export const findResultByQuizId = (quizId) => {
  return Result.findOne({ quizId: new ObjectId(quizId) });
};

/**
 * Retrieves paginated past quiz results for an employee
 * @param {string} employeeId - The ID of the employee
 * @param {number} page - Page number for pagination (default: 0)
 * @param {number} size - Number of results per page (default: 10)
 * @returns {Promise<Object>} Object containing paginated results, total count, and pagination info
 */
export const getEmployeePastResults = async (
  employeeId,
  page = 0,
  size = 10,
) => {
  const skip = parseInt(page) * parseInt(size);
  const limit = parseInt(size);

  const results = await Result.aggregate([
    { $match: { employeeId: new ObjectId(employeeId) } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'total' }],
      },
    },
  ]);

  const data = results[0].data;
  const total =
    results[0].totalCount.length > 0 ? results[0].totalCount[0].total : 0;

  return { data, total, page, size };
};
