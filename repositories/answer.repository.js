import Answer from '../models/answer.model.js';
import EmployeeRepository from '../repositories/employee.repository.js';
import EmployeeService from '../services/employee.service.js';

const employeeRepository = new EmployeeRepository();
const employeeSerivce = new EmployeeService(employeeRepository);

class AnswerRepository {
  async calculateScore(userAnswers, correctAnswers) {
    let score = 0;
    userAnswers.forEach(({ questionId, answer }) => {
      const correctAnswer = correctAnswers.find(
        (q) =>{
          return q._id.toString() === questionId
        },
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
    quizId
  ) {
    userAnswers = JSON.parse(userAnswers);
    const score = await this.calculateScore(userAnswers, correctAnswers);

    await Answer.insert({
      answers: userAnswers,
      score: score,
      employeeId: employeeId,
      quizId: quizId
    });

    await employeeSerivce.updateWeeklyQuizScore(employeeId, score);

    return { status: 200, data: 'Answers submitted successfully' };
  }
}

export default AnswerRepository;
