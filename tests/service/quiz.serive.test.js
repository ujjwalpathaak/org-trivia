import employeeRepository from '../../repositories/employee.repository.js';
import questionRepository from '../../repositories/question.repository.js';
import quizRepository from '../../repositories/quiz.repository.js';
import quizService from '../../services/quiz.service.js';
import resultService from '../../services/result.service.js';
jest.mock('../../repositories/employee.repository.js');

jest.mock('../../repositories/quiz.repository.js');
jest.mock('../../repositories/question.repository.js');

describe('Quiz Service', () => {
  describe('calculateWeeklyQuizScore', () => {
    it('should return correct quiz score', async () => {
      const userAnswers = [
        { questionId: '1', answer: 'A' },
        { questionId: '2', answer: 'B' },
      ];
      const correctAnswers = [
        { _id: '1', answer: 'A' },
        { _id: '2', answer: 'B' },
      ];

      const score = await resultService.calculateWeeklyQuizScore(
        userAnswers,
        correctAnswers,
      );
      expect(score).toBe(20);
    });
  });

  describe('getWeeklyQuizStatusService', () => {
    it('should return correct status for cancelled quiz', async () => {
      quizRepository.getQuizStatus.mockResolvedValue({ status: 'cancelled' });
      employeeRepository.isWeeklyQuizGiven.mockResolvedValue({
        quizGiven: false,
      });
      const status = await quizService.getWeeklyQuizStatusService(
        'org1',
        'emp1',
      );
      expect(status).toBe(0);
    });

    it('should return correct status for live quiz not given', async () => {
      quizRepository.getQuizStatus.mockResolvedValue({ status: 'live' });
      employeeRepository.isWeeklyQuizGiven.mockResolvedValue({
        quizGiven: false,
      });
      const status = await quizService.getWeeklyQuizStatusService(
        'org1',
        'emp1',
      );
      expect(status).toBe(1);
    });

    it('should return correct status for live quiz already given', async () => {
      quizRepository.getQuizStatus.mockResolvedValue({ status: 'live' });
      employeeRepository.isWeeklyQuizGiven.mockResolvedValue({
        quizGiven: true,
      });
      const status = await quizService.getWeeklyQuizStatusService(
        'org1',
        'emp1',
      );
      expect(status).toBe(2);
    });

    it('should return correct status for upcoming quiz', async () => {
      quizRepository.getQuizStatus.mockResolvedValue({ status: 'upcoming' });
      employeeRepository.isWeeklyQuizGiven.mockResolvedValue({
        quizGiven: false,
      });
      const status = await quizService.getWeeklyQuizStatusService(
        'org1',
        'emp1',
      );
      expect(status).toBe(3);
    });
  });

  describe('makeWeeklyQuizLiveService', () => {
    it('should make all weekly quizzes live', async () => {
      quizRepository.makeWeeklyQuizLive.mockResolvedValue(true);
      const result = await quizService.makeWeeklyQuizLiveService();
      expect(result).toEqual({ message: 'All weekly quizzes are live' });
    });
  });

  describe('cleanUpWeeklyQuizService', () => {
    it('should clean up weekly quiz data', async () => {
      quizRepository.markAllQuizAsExpired.mockResolvedValue(true);
      employeeRepository.updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven.mockResolvedValue(
        true,
      );
      questionRepository.dropWeeklyQuestionCollection.mockResolvedValue(true);

      const result = await quizService.cleanUpWeeklyQuizService();
      expect(result).toEqual({ message: 'Cleaned up weekly quiz.' });
    });
  });
});
