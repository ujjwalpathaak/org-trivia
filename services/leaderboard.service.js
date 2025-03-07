import { getMonthAndYear } from '../client/src/utils.js';

class leaderboardService {
  constructor(leaderboardRespository) {
    this.leaderboardRespository = leaderboardRespository;
  }

  async getLeaderboardByOrg(orgId) {
    const [month, year] = getMonthAndYear();
    return await this.leaderboardRespository.getLeaderboardByOrg(
      orgId,
      month,
      year,
    );
  }
}

export default leaderboardService;
