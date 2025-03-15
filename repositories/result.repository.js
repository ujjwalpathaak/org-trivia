import Result from '../models/result.model.js';

import { ObjectId } from 'mongodb';

class ResultRepository {
  async submitWeeklyQuizAnswers(
    employeeId,
    orgId,
    quizId,
    multiplier,
    score,
    points,
    date,
    genre,
    answers,
  ) {
    return await Result.create({
      employeeId,
      orgId,
      quizId,
      score,
      points,
      multiplier,
      date,
      genre,
      answers,
    });
  }

  async getParticipationByGenre(orgId) {
    return await Result.aggregate([
      { $match: { orgId: new ObjectId(orgId) } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getEmployeePastResults(employeeId) {
    return Result.aggregate([
      { $match: { employeeId: new ObjectId(employeeId) } },
      { $sort: { date: -1 } },
    ]);
  }
}

export default ResultRepository;
