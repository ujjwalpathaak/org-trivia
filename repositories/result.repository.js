import Result from "../models/result.model.js";
import { ObjectId } from "mongodb"
class ResultRepository {
  async submitWeeklyQuizAnswers(
    employeeId,
    orgId,
    quizId,
    weeklyQuizScore,
    date,
    genre,
    answers,
  ) {
    return Result.create({
      employeeId: employeeId,
      orgId: orgId,
      quizId: quizId,
      score: weeklyQuizScore,
      date: date,
      genre: genre,
      answers: answers,
    });
  }
}

export default ResultRepository;
