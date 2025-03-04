import Answer from '../models/answer.model.js';
import EmployeeRepository from '../repositories/employee.repository.js';
import EmployeeService from '../services/employee.service.js';

const employeeSerivce = new EmployeeService(new EmployeeRepository());

class AnswerRepository {
  async calculateWeeklyQuizScore(userAnswers, correctAnswers) {
    let weeklyQuizScore = 0;

    userAnswers.forEach(({ questionId, answer }) => {
      const correctAnswer = correctAnswers.find(
        (correctAnswer) => correctAnswer._id.toString() === questionId,
      );

      if (correctAnswer && answer === correctAnswer.answer) {
        weeklyQuizScore += 10;
      }
    });

    return weeklyQuizScore;
  }

  async submitWeeklyQuizAnswers(
    userAnswers,
    correctAnswers,
    employeeId,
    quizId,
  ) {
    const userAnswersJSON = JSON.parse(userAnswers);
    const weeklyQuizScore = await this.calculateWeeklyQuizScore(
      userAnswersJSON,
      correctAnswers,
    );
    console.log(weeklyQuizScore);

    // await Answer.insert({
    //   answers: userAnswersJSON,
    //   currentPoints: weeklyQuizScore,
    //   employeeId: employeeId,
    //   quizId: quizId,
    // });

    await employeeSerivce.updateWeeklyQuizScore(employeeId, weeklyQuizScore);

    return;
  }
}

export default AnswerRepository;
