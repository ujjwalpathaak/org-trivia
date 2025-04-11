import Badge from '../models/badge.model.js';

/**
 * Finds a badge by its rank
 * @param {string} rank - The rank of the badge (e.g., 'Gold', 'Silver', 'Bronze')
 * @returns {Promise<Object|null>} The badge document or null if not found
 */
export const findBadgeByRank = async (rank) => {
  return Badge.findOne({ rank });
};

/**
 * Finds a badge by its streak requirement
 * @param {string} streak - The streak duration (e.g., '3 Months', '6 Months', '1 Year')
 * @returns {Promise<Object|null>} The badge document or null if not found
 */
export const findBadgeByStreak = async (streak) => {
  return Badge.findOne({ streak });
};
