class OrgService {
  constructor(orgRepository) {
    this.orgRepository = orgRepository;
  }

  async getTriviaEnabledOrgs() {
    const triviaEnabledOrgs = await this.orgRepository.getTriviaEnabledOrgs();

    return triviaEnabledOrgs;
  }

  async setNextQuestionGenre(orgId, currentGenreIndex) {
    return await this.orgRepository.setNextQuestionGenre(
      orgId,
      currentGenreIndex,
    );
  }

  async changeGenreSettings(genre, orgId) {
    await this.orgRepository.changeGenreSettings(genre, orgId);
    return;
  }

  async getSettings(orgId) {
    const org = await this.orgRepository.getSettings(orgId);

    return org.settings;
  }

  // -------------------------------------------------------------

  async getAllOrgNames() {
    const orgNames = await this.orgRepository.getAllOrgNames();

    return { status: 200, data: orgNames };
  }

  async getOrgById(orgId) {
    const org = await this.orgRepository.getOrgById(orgId);

    return { status: 200, data: org };
  }

  async toggleTrivia(orgId) {
    await this.orgRepository.toggleTrivia(orgId);

    return { status: 200, data: `Trivia toggled` };
  }
}

export default OrgService;
