import Result from '../models/result.model.js';
import { ObjectId } from 'mongodb';
class ResultRepository {
  async submitWeeklyQuizAnswers(
    employeeId,
    orgId,
    quizId,
    weeklyQuizScore,
    date,
    genre,
    mergedUserAnswersAndCorrectAnswers,
  ) {
    return Result.create({
      employeeId: employeeId,
      orgId: orgId,
      quizId: quizId,
      score: weeklyQuizScore,
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
