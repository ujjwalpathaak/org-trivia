import Answer from '../models/answer.model.js';
import EmployeeRepository from '../repositories/employee.repository.js';
import EmployeeService from '../services/employee.service.js';

const employeeSerivce = new EmployeeService(new EmployeeRepository());

class AnswerRepository {
  async calculateScore(userAnswers, correctAnswers) {
    let score = 0;

    userAnswers.forEach(({ questionId, answer }) => {
      const correctAnswer = correctAnswers.find(
        (correctAnswer) => correctAnswer._id.toString() === questionId,
      );

      if (correctAnswer && answer === correctAnswer.answer) {
        score += 10;
      }
    });

    return score;
  }

  async submitWeeklyQuizAnswers(
    userAnswers,
    correctAnswers,
    employeeId,
    quizId,
  ) {
    const userAnswersJSON = JSON.parse(userAnswers);
    const score = await this.calculateScore(userAnswersJSON, correctAnswers);

    await Answer.insert({
      answers: userAnswersJSON,
      score: score,
      employeeId: employeeId,
      quizId: quizId,
    });

    await employeeSerivce.updateWeeklyQuizScore(employeeId, score);

    return { status: 200, data: 'Answers submitted successfully' };
  }
}

export default AnswerRepository;
