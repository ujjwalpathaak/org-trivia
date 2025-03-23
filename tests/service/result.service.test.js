import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../../middleware/utils.js';
import employeeRepository from '../../repositories/employee.repository.js';
import leaderboardRepository from '../../repositories/leaderboard.respository.js';
import quizRepository from '../../repositories/quiz.repository.js';
import resultRepository from '../../repositories/result.repository.js';
import questionService from '../../services/question.service.js';
import resultService from '../../services/result.service.js';

jest.mock('../../repositories/employee.repository.js');
jest.mock('../../repositories/leaderboard.respository.js');
jest.mock('../../repositories/quiz.repository.js');
jest.mock('../../repositories/result.repository.js');
jest.mock('../../services/question.service.js');
jest.mock('../../middleware/utils.js');

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

  describe('getEmployeePastResultsService', () => {
    it('should call resultRepository.getEmployeePastResults', async () => {
      resultRepository.getEmployeePastResults.mockResolvedValue(true);
      const response = await resultService.getEmployeePastResultsService(
        '123',
        1,
        10,
      );
      expect(resultRepository.getEmployeePastResults).toHaveBeenCalledWith(
        '123',
        1,
        10,
      );
      expect(response).toBe(true);
    });
  });

  describe('submitWeeklyQuizAnswersService', () => {
    it('should return success when quiz submission is valid', async () => {
      questionService.getWeeklyQuizCorrectAnswers.mockResolvedValue([
        { _id: '1', answer: 'A' },
      ]);
      employeeRepository.updateWeeklyQuizScore.mockResolvedValue({
        multiplier: 2,
        score: 20,
      });
      leaderboardRepository.updateLeaderboard.mockResolvedValue(true);
      quizRepository.findLiveQuizByOrgId.mockResolvedValue({
        genre: 'Science',
      });
      resultRepository.submitWeeklyQuizAnswers.mockResolvedValue(true);
      getMonthAndYear.mockReturnValue([8, 2024]);
      mergeUserAnswersAndCorrectAnswers.mockReturnValue([]);

      const result = await resultService.submitWeeklyQuizAnswersService(
        [{ questionId: '1', answer: 'A' }],
        'emp1',
        'org1',
        'quiz1',
      );

      expect(result).toEqual({
        success: true,
        multiplier: 2,
        score: 20,
        points: 10,
      });
    });

    it('should return error if employee score update fails', async () => {
      questionService.getWeeklyQuizCorrectAnswers.mockResolvedValue([
        { _id: '1', answer: 'A' },
      ]);
      employeeRepository.updateWeeklyQuizScore.mockResolvedValue(null);

      const result = await resultService.submitWeeklyQuizAnswersService(
        [{ questionId: '1', answer: 'A' }],
        'emp1',
        'org1',
        'quiz1',
      );

      expect(result).toEqual({
        success: false,
        message: 'Error updating employee score - quiz already given',
      });
    });
  });
});
