import Badge from '../models/badge.model.js';

export const findBadgeByRank = async (rank) => {
  return Badge.findOne({ rank });
};

export const findBadgeByStreak = async (streak) => {
  return Badge.findOne({ streak });
};
