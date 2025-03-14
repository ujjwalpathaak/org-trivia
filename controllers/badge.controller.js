import BadgeRepository from '../repositories/badge.repository.js';
import BadgeService from '../services/badge.service.js';

const badgeService = new BadgeService(new BadgeRepository());

class BadgeController {}

export default BadgeController;
