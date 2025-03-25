import Badge from '../models/badge.model.js';

const findBadgeByRank = async (rank) => {
  return Badge.findOne({ rank });
};

const findBadgeByStreak = async (streak) => {
  return Badge.findOne({ streak });
};

export default { findBadgeByRank, findBadgeByStreak };
