import Result from '../models/result.model.js';
import { ObjectId } from 'mongodb';
class ResultRepository {
  async submitWeeklyQuizAnswers(
    employeeId,
    orgId,
    quizId,
    multiplier,
    score,
    rawScore,
    date,
    genre,
    mergedUserAnswersAndCorrectAnswers,
  ) {
    return Result.create({
      employeeId: employeeId,
      orgId: orgId,
      quizId: quizId,
      score: score,
      rawScore: rawScore,
      multiplier: multiplier,
      date: date,
      genre: genre,
      answers: mergedUserAnswersAndCorrectAnswers,
    });
  }

  async getEmployeePastRecords(employeeId) {
    return Result.aggregate([
      { $match: { employeeId: new ObjectId(employeeId) } },
      { $sort: { date: -1 } },
    ]);
  }
}

export default ResultRepository;
