class OrgService {
  constructor(orgRepository) {
    this.orgRepository = orgRepository;
  }

  async changeGenreSettings(genre, orgId) {
    return await this.orgRepository.changeGenreSettings(genre, orgId);
  }

  async getSettings(orgId) {
    const org = await this.orgRepository.getSettings(orgId);

    return org.settings;
  }

  async getAllOrgNames() {
    return await this.orgRepository.getAllOrgNames();
  }

  async getOrgById(orgId) {
    return await this.orgRepository.getOrgById(orgId);
  }

  async toggleTrivia(orgId) {
    const org = await this.orgRepository.isTriviaEnabled(orgId);

    if (!org) return false;

    const newStatus = !org.settings.isTriviaEnabled;

    return await this.orgRepository.updateTriviaSettings(orgId, newStatus);
  }

  async getAnalytics(orgId){
    return await this.orgRepository.getAnalytics(orgId);
  }
}

export default OrgService;
