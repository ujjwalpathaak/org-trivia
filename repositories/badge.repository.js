import Badge from '../models/badge.model.js';

class BadgeRepository {
  async findBadgeByRank(rank) {
    return Badge.findOne({ rank });
  }
}

export default BadgeRepository;
