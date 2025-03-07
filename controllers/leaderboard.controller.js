import LeaderboardService from '../services/leaderboard.service.js'
import LeaderboardRepository from '../repositories/leaderboard.respository.js'

const leaderboardSerivce = new LeaderboardService(new LeaderboardRepository())

class LeaderboardController {
}

export default LeaderboardController;
