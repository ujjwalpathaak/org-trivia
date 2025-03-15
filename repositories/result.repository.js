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
    mergedUserAnswersAndCorrectAnswers,
  ) {
    return Result.create({
      employeeId: employeeId,
      orgId: orgId,
      quizId: quizId,
      score: score,
      points: points,
      multiplier: multiplier,
      date: date,
      genre: genre,
      answers: mergedUserAnswersAndCorrectAnswers,
    });
  }

  async getParticipationByGenre(orgId) {
    return Result.aggregate([
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
