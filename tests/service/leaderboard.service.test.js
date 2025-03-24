import {
  getMonthAndYear,
  getPreviousMonthAndYear,
} from '../../middleware/utils.js';
import leaderboardRespository from '../../repositories/leaderboard.respository.js';
import leaderboardService from '../../services/leaderboard.service.js';

jest.mock('../../repositories/leaderboard.respository.js');
jest.mock('../../middleware/utils.js');

describe('Leaderboard Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboardByOrg', () => {
    it('should return leaderboard data for the given organization', async () => {
      getMonthAndYear.mockReturnValue([3, 2024]);
      const mockLeaderboard = [
        { userId: 1, score: 100 },
        { userId: 2, score: 90 },
      ];
      leaderboardRespository.getLeaderboardByOrg.mockResolvedValue(
        mockLeaderboard,
      );

      const result = await leaderboardService.getLeaderboardByOrg('org123');

      expect(result).toEqual(mockLeaderboard);
      expect(leaderboardRespository.getLeaderboardByOrg).toHaveBeenCalledWith(
        'org123',
        3,
        2024,
      );
    });
  });

  describe('resetLeaderboard', () => {
    it('should reset the leaderboard using current and previous month data', async () => {
      getMonthAndYear.mockReturnValue([3, 2024]);
      getPreviousMonthAndYear.mockReturnValue([2, 2024]);
      leaderboardRespository.resetLeaderboard.mockResolvedValue(
        'Leaderboard reset',
      );

      const result = await leaderboardService.resetLeaderboard();

      expect(result).toEqual('Leaderboard reset');
      expect(leaderboardRespository.resetLeaderboard).toHaveBeenCalledWith(
        3,
        2024,
        2,
        2024,
      );
    });
  });
});
