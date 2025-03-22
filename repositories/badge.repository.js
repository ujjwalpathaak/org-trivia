import Badge from '../models/badge.model.js';

const findBadgeByRank = async (rank) => {
  return Badge.findOne({ rank });
};

export default { findBadgeByRank };
