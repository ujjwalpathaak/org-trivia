import { getMonthAndYear } from '../client/src/utils.js';

class LeaderboardService {
  constructor(leaderboardRespository, orgRepository) {
    this.leaderboardRespository = leaderboardRespository;
    this.orgRepository = orgRepository;
  }

  async getLeaderboardByOrg(orgId) {
    const [month, year] = getMonthAndYear();
    return await this.leaderboardRespository.getLeaderboardByOrg(
      orgId,
      month,
      year,
    );
  }

  async resetLeaderboard() {
    const [month, year] = getMonthAndYear();
    return await this.leaderboardRespository.resetLeaderboard(month, year);
  }
}

export default LeaderboardService;
