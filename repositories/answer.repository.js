import EmployeeRepository from '../repositories/employee.repository.js';
import EmployeeService from '../services/employee.service.js';

const employeeRepository = new EmployeeRepository();
const employeeSerivce = new EmployeeService(employeeRepository);

class AnswerRepository {
  async calculateScore(userAnswers, correctAnswers) {
    let score = 0;

    userAnswers.forEach(({ questionId, answer }) => {
      const correctAnswer = correctAnswers.find(
        (q) => q.questionId === questionId,
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
    orgId,
  ) {
    userAnswers = JSON.parse(userAnswers);
    const score = calculateScore(userAnswers, correctAnswers);
    await employeeSerivce.updateWeeklyQuizScore(employeeId, score);

    return { status: 200, data: 'Answers submitted successfully' };
  }
}

export default AnswerRepository;
