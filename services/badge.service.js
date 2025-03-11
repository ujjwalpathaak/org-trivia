class BadgeService {
  constructor(badgeRepository) {
    this.badgeRepository = badgeRepository;
  }

  async getEmployeeBadges(employeeId) {
    return await this.badgeRepository.getEmployeeBadges(employeeId);
  }
}

export default BadgeService;
