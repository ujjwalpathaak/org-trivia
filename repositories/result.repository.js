import { ObjectId } from 'mongodb';

import Result from '../models/result.model.js';

const submitWeeklyQuizAnswers = async (
  employeeId,
  orgId,
  quizId,
  multiplier,
  score,
  points,
  genre,
  answers,
) => {
  return await Result.create({
    employeeId,
    orgId,
    quizId,
    score,
    points,
    multiplier,
    genre,
    answers,
  });
};

const getParticipationByGenre = async (orgId) => {
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

const getEmployeePastResults = async (employeeId, page = 0, size = 10) => {
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

export default {
  submitWeeklyQuizAnswers,
  getParticipationByGenre,
  getEmployeePastResults,
};
